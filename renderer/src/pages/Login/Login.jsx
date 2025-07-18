import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/userStore";
import "./Login.css";
import useLanguageStore from '../../stores/languageStore';

const Login = () => {
  const language = useLanguageStore((state) => state.language);
  const t = (en, de) => language === 'de' ? de : en;
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  
  // Get user store state and actions
  const { login, isLoading, error, clearError } = useUserStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    const result = await login(identifier, password);
    
    if (result.success) {
      // console.log('Login successful:', result.user);
      // console.log(result);
      navigate("/sales-interface");
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>{t('Login', 'Anmelden')}</h2>
        <input
          type="text"
          placeholder={t('Username or Email', 'Benutzername oder E-Mail')}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          disabled={isLoading}
        />
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t('Password', 'Passwort')}
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
            {t('Forgot Password?', 'Passwort vergessen?')}
          </a>
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? t('Logging in...', 'Einloggen...') : t('Login', 'Anmelden')}
        </button>
        
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
