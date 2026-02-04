import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaTwitter } from "react-icons/fa";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle error from URL (e.g, /login?error=true)
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get("error")) {
      setErrorMsg("Login failed. Please check your credentials.");
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        username,
        password,
      });

      const { id, username: user, role, token, email } = response.data;

      localStorage.setItem("userId", id);
      localStorage.setItem("username", user);
      localStorage.setItem("role", role);
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      localStorage.setItem("authType", "normal");

      setTimeout(() => {
        navigate((role ?? "USER").toUpperCase() === "ADMIN" ? "/adminhome" : "/home");
      }, 500);
    } catch (err) {
      setErrorMsg("Invalid credentials. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="login-wrapper">
      <div className="login-image">
        <img src="/Dorcas-image.png" alt="Login Visual" />
      </div>

      <div className="login-form-container">
        <div className="login-form">
          <img src="/Dorcas-logo.jpg" alt="Logo" className="logo" />
          <h2>Welcome Back :)</h2>
          <p>Please login with your Username and password</p>

          {errorMsg && <div className="error-msg">{errorMsg}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-field">
              <FiMail className="input-icon" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-field">
              <FiLock className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-options">
              <label>
                <input type="checkbox" /> Remember Me
              </label>
              <Link to="/forgotpassword">Forgot Password?</Link>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login Now"}
            </button>

            <div className="form-footer">
              <p>Don't have an account? <Link to="/register">Create Account</Link></p>
              <p>Or you can join with</p>
              <div className="social-icons">
                <button type="button" onClick={handleGoogleLogin} title="Login with Google">
                  <FcGoogle size={24} />
                </button>
                <button type="button" title="Login with Facebook">
                  <FaFacebook size={24} color="#3b5998" />
                </button>
                <button type="button" title="Login with Twitter">
                  <FaTwitter size={24} color="#1da1f2" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
