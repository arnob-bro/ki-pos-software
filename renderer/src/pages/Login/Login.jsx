import React, { useState } from "react"
import { FaEye, FaEyeSlash, FaUser, FaLock, FaStore } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import useUserStore from "../../stores/userStore"
import "./Login.css"

const Login = () => {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  // Get user store state and actions
  const { login, isLoading, error, clearError } = useUserStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    const result = await login(identifier, password)

    if (result.success) {
      // console.log('Login successful:', result.user);
      // console.log(result);
      navigate("/sales-interface")
    }
  }

  const togglePassword = () => setShowPassword(!showPassword)

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <FaStore className="logo-icon" />
              <h1 className="logo-text">KI POS</h1>
            </div>
            <h2 className="welcome-text">Welcome Back</h2>
            <p className="welcome-subtitle">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Username or Email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  disabled={isLoading}
                  className="form-input"
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="form-input"
                />
                <span className="password-toggle" onClick={togglePassword}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <div className="form-options">
              {/* <label className="remember-me">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label> */}
              <a
                href="#"
                className="forgot-password"
                onClick={(e) => e.preventDefault()}>
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}
          </form>

          <div className="login-footer">
            <p>© 2025 KI POS System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
