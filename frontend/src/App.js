// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EABuilder from './pages/EABuilder';
import Backtesting from './pages/Backtesting';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Backtest from './pages/Backtest';
import SubscriptionStatus from './pages/SubscriptionStatus';
import PremiumUpgrade from './pages/PremiumUpgrade';
import AdminDashboard from './pages/AdminDashboard';
import PaymentPage from './pages/PaymentPage';
import MarketplacePage from './pages/MarketplacePage';
import PurchasePage from './pages/PurchasePage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import EnhancedAdminDashboard from './pages/EnhancedAdminDashboard';
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
            <Link to="/backtest">Run Backtest</Link> |{' '}
            <Link to="/subscription-status">Subscription Status</Link> |{' '}
            <Link to="/premium-upgrade">Premium Upgrade</Link> |{' '}
            <Link to="/admin/dashboard">Admin Dashboard</Link> |{' '}
            <Link to="/payment">Payment</Link> |{' '}
            <Link to="/marketplace">Marketplace</Link> |{' '}
            <Link to="/purchase">Purchase</Link> |{' '}
            <Link to="/analytics">Analytics</Link> |{' '}
            <Link to="/admin/analytics">Enhanced Admin Analytics</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/builder" element={<EABuilder />} />
          <Route path="/backtesting" element={<Backtesting />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/backtest" element={<Backtest />} />
          <Route path="/subscription-status" element={<SubscriptionStatus />} />
          <Route path="/premium-upgrade" element={<PremiumUpgrade />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/purchase" element={<PurchasePage />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin/analytics" element={<EnhancedAdminDashboard />} />
        </Routes>
        <footer className="footer">
          <p>© 2025 EA Builder Platform</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
