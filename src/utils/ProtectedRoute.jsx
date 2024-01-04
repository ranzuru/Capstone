import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Adjust the import path as per your project structure
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = () => {
  const { user, loading } = useAuth(); // Accessing the current user and loading state

  if (loading) {
    // Show loading indicator while checking authentication
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  return user ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
