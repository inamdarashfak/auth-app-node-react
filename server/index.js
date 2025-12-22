const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Initialize SQLite database
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create Users Table if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT,
  description TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, "secretkey", (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};

// Register API
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
  db.run(query, [email, hashedPassword], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ msg: "Email already exists" });
      }
      return res
        .status(500)
        .json({ msg: "Database error", error: err.message });
    }
    res.json({ msg: "User registered successfully" });
  });
});

// Login API
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], async (err, user) => {
    if (err) {
      return res
        .status(500)
        .json({ msg: "Database error", error: err.message });
    }
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, "secretkey", { expiresIn: "1h" });
    res.json({ token });
  });
});
//create note API
app.post("/notes", authenticateToken, (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ msg: "Title and description required" });
  }

  const query = `INSERT INTO notes (user_id, title, description) VALUES (?, ?, ?)`;
  db.run(query, [req.user.id, title, description], function (err) {
    if (err)
      return res
        .status(500)
        .json({ msg: "Database error", error: err.message });
    res.json({ id: this.lastID, title, description });
  });
});

app.get("/notes", authenticateToken, (req, res) => {
  const query = `SELECT * FROM notes WHERE user_id = ?`;
  db.all(query, [req.user.id], (err, rows) => {
    if (err)
      return res
        .status(500)
        .json({ msg: "Database error", error: err.message });
    res.json(rows);
  });
});

app.put("/notes/:id", authenticateToken, (req, res) => {
  const { title, description } = req.body;
  const noteId = req.params.id;

  const query = `UPDATE notes SET title = ?, description = ? WHERE id = ? AND user_id = ?`;
  db.run(query, [title, description, noteId, req.user.id], function (err) {
    if (err)
      return res
        .status(500)
        .json({ msg: "Database error", error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ msg: "Note not found" });
    res.json({ msg: "Note updated successfully" });
  });
});

app.delete("/notes/:id", authenticateToken, (req, res) => {
  const noteId = req.params.id;

  const query = `DELETE FROM notes WHERE id = ? AND user_id = ?`;
  db.run(query, [noteId, req.user.id], function (err) {
    if (err)
      return res
        .status(500)
        .json({ msg: "Database error", error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ msg: "Note not found" });
    res.json({ msg: "Note deleted successfully" });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
