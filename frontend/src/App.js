// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EABuilder from './pages/EABuilder';
import Backtesting from './pages/Backtesting';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Backtest from './pages/Backtest'; // Import the new Backtest page
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <header className="header">
          <nav>
            <Link to="/">Dashboard</Link> |{' '}
            <Link to="/builder">EA Builder</Link> |{' '}
            <Link to="/backtesting">Backtesting</Link> |{' '}
            <Link to="/login">Login</Link> |{' '}
            <Link to="/signup">Signup</Link> |{' '}
            <Link to="/backtest">Run Backtest</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/builder" element={<EABuilder />} />
          <Route path="/backtesting" element={<Backtesting />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/backtest" element={<Backtest />} /> {/* New route */}
        </Routes>
        <footer className="footer">
          <p>© 2025 EA Builder Platform</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
