import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SystemMonitor from './pages/SystemMonitor';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/monitor" element={<SystemMonitor />} />
        <Route path="/signup" element={<SystemMonitor />} />
        <Route path="*" element={<Navigate to="/monitor" replace />} />
      </Routes>
    </Router>
  );
}

export default App;