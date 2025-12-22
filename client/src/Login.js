import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import "./index.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [message, setMessage] = useState("");
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/login", {
        email,
        password,
      });
      history.push({
        pathname: "/notes",
        state: { token: response.data.token },
      });
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
          <h2 style={{ fontFamily: "monospace" }}>Login</h2>
          <form onSubmit={handleLogin}>
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
            <button type="submit" className="button">
              Login
            </button>
          </form>
          <p className="error">{message}</p>
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
