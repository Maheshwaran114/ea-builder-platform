// src/pages/Signup.js
import React, { useState } from 'react';
import { signupUser } from '../api/auth';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const data = await signupUser(username, password);
      setUser(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Signup failed. Username might already exist.');
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit">Signup</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {user && <p style={{ color: 'green' }}>Signup successful! Welcome, {user.username}.</p>}
    </div>
  );
}

export default Signup;
