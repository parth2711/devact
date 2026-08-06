import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GenericPageSkeleton } from './SkeletonLoaders';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <GenericPageSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
