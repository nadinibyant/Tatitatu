// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Ambil data user dari localStorage
  const userData = JSON.parse(localStorage.getItem('userData'));
  
  // Jika tidak ada userData, redirect ke login
  if (!userData || !userData.token) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada role yang diizinkan dan role user tidak termasuk, redirect ke dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;