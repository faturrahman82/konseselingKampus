import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { useAuthStore } from './store/useAuthStore';

// Protected Route Component
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { user } = useAuthStore();
  
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<div>Register Page (TBD)</div>} />
        
        {/* User Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <div className="p-8">
              <h1 className="text-2xl font-bold">User Dashboard</h1>
              <p>Welcome back!</p>
            </div>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute role="ADMIN">
            <div className="p-8">
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
