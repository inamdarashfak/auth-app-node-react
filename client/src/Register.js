import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/register", {
        email,
        password,
      });
      if (response.data.msg === "Email already exists") {
        setMessage(response.data.msg);
      } else {
        alert("User registred succesfully. you may now login");
        window.location.pathname = "/login";
      }
    } catch (error) {
      setMessage(error.response.data.msg);
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <div
          style={{
            padding: "20px",
            border: "1px solid gray",
          }}
        >
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
            <button type="submit">Register</button>
          </form>
          <p style={{ color: "red" }}>{message}</p>
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
