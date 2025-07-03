import { useState } from 'react';
import './App.css';

function App() {
  const [form, setForm] = useState({ userId: '', password: '' });
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await window.posAPI.login(form.userId, form.password);
      if (result.success) {
        setUserInfo(result.user); // Contains id, role, etc.
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    }
  };

  if (userInfo) {
    
  console.log('userInfo:', userInfo); 
    return (
      <div className="login-success">
        <h1>Login Successful!</h1>
        <p><strong>User ID:</strong> {userInfo.user_id}</p>
        <p><strong>Role:</strong> {userInfo.role.toUpperCase()}</p>
        <p>You have logged in as a <strong>{userInfo.role}</strong>.</p>
        {/* Later: redirect to dashboard or role-based component */}
      </div>
    );
  }

  return (
    <div className="login-container">
      <h1>POS Login</h1>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          name="userId"
          placeholder="User ID"
          value={form.userId}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
        {error && <p className="error-msg">{error}</p>}
      </form>
    </div>
  );
}

export default App;
