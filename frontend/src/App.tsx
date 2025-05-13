import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkshopDetail from './pages/WorkshopDetail';
import PainPoints from './pages/PainPoints';
import UseCases from './pages/UseCases';
import ActionPlans from './pages/ActionPlans';
import Report from './pages/Report';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workshops/:id" element={<WorkshopDetail />} />
          <Route path="/workshops/:id/painpoints" element={<PainPoints />} />
          <Route path="/workshops/:id/usecases" element={<UseCases />} />
          <Route path="/usecases/:id/actionplans" element={<ActionPlans />} />
          <Route path="/workshops/:id/report" element={<Report />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
