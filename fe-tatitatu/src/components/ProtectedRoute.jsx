// components/ProtectedRoute.jsx
import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const token = localStorage.getItem('token');
  
  const isTokenValid = () => {
    if (!token) return false;

    try {
      const decodedToken = jwtDecode(token);
      const expirationTime = decodedToken.exp * 1000; 
      const currentTime = Date.now();

      return currentTime < expirationTime;
    } catch (error) {
      return false;
    }
  };

  if (!userData || !token || !isTokenValid()) {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;