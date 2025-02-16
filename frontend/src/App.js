// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EABuilder from './pages/EABuilder';
import Backtesting from './pages/Backtesting';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <header>
          <nav>
            <Link to="/">Dashboard</Link> |{' '}
            <Link to="/builder">EA Builder</Link> |{' '}
            <Link to="/backtesting">Backtesting</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/builder" element={<EABuilder />} />
          <Route path="/backtesting" element={<Backtesting />} />
        </Routes>
        <footer>
          <p>© 2025 EA Builder Platform</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
