import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);
    
    try {
      if (!window.posAPI || !window.posAPI.login) {
        throw new Error("POS API not available");
      }

      const result = await window.posAPI.login(identifier, password);
      console.log('Login result:', result);
      
      if (result.success) {
        // Store user info
        localStorage.setItem('userInfo', JSON.stringify(result.user));
        
        // Store permissions
        if (result.permissions) {
          localStorage.setItem('userPermissions', JSON.stringify(result.permissions));
          localStorage.setItem('permissionCodes', JSON.stringify(result.permissionCodes));
          console.log('User permissions:', result.permissions);
          console.log('Permission codes:', result.permissionCodes);
        }
        
        // Store tokens
        localStorage.setItem('accessToken', result.tokens?.accessToken || '');
        localStorage.setItem('refreshToken', result.tokens?.refreshToken || '');
        
        navigate("/sales-interface");
      } else {
        setErrorMsg(result.message || 'Login failed');
        console.log('Login Error:', result.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username or Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          disabled={isLoading}
        />
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <span className="password-toggle" onClick={togglePassword}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="forgot-password">
          <a href="#" onClick={(e) => e.preventDefault()}>
            Forgot Password?
          </a>
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
        
        {errorMsg && <p className="error">{errorMsg}</p>}
      </form>
    </div>
  );
};

export default Login;
