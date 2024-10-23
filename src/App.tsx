import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import CreateCoupon from './components/CreateCoupon';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-coupon" element={<CreateCoupon />} />
      </Routes>
    </Router>
  );
}

export default App;
