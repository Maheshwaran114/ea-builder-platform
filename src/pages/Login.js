import React, { useState } from 'react';
import { loginUser } from '../api/auth';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      const data = await loginUser(username, password);
      setToken(data.token);
      // Optionally, store token in localStorage or context for authenticated requests
      localStorage.setItem('jwt', data.token);
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      {error && <p>{error}</p>}
      {token && <p>Logged in! Token: {token}</p>}
    </div>
  );
}

export default Login;
