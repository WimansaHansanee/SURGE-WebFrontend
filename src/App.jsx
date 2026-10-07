import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage'; 
import Dashboard from './pages/Dashboard'; 

export default function App() {
  return (
    <Router>
      <Routes>
        {/* The Map will show on the root URL */}
        <Route path="/" element={<MainPage />} />
        
        {/* The Sensor Dashboard will show here */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}