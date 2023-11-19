import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Adjust the import path as per your project structure

const ProtectedRoute = () => {
  const { user } = useAuth(); // Accessing the current user

  return user ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
