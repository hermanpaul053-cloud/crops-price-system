import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // install with: npm install jwt-decode

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded: any = jwtDecode(token);
    const role = decoded.role || localStorage.getItem('role');
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  } catch {
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;