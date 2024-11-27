import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import CreateCoupon from './components/CreateCoupon';
import CouponList from './components/CouponList';
import ExtensionFeatures from './components/ExtensionFeatures';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-coupon" element={<CreateCoupon />} />
        <Route path="/list" element={<CouponList />} />
        <Route path="/extension" element={<ExtensionFeatures />} />
      </Routes>
    </Router>
  );
}

export default App;
