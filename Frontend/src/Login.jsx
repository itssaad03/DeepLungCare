import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import PopupMessage from "./popupmessage.jsx"; // Adjusted relative path

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const showPopup = (message, type = "info") => {
    setPopup({ message, type });
    setTimeout(() => setPopup({ message: "", type: "" }), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    showPopup("", ""); // Clear popup

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      showPopup("Login successful!", "success");

      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      showPopup(err.message || "Something went wrong during login", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div>
        <h1>Authentication</h1>
        <p><i>Platform on which you can trust</i></p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </div>
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="register-link">Register</Link>
          </p>
        </form>
      </div>

      {/* Popup Message Component */}
      <PopupMessage
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ message: "", type: "" })}
      />
    </div>
  );
};

export default Login;
