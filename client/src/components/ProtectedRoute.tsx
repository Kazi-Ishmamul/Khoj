import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthRole, getAuthState, getDashboardPath } from '../helpers/auth';

interface ProtectedRouteProps {
    allowedRoles?: AuthRole[];
    guestOnly?: boolean;
}

const ProtectedRoute = ({ allowedRoles, guestOnly = false }: ProtectedRouteProps) => {
    const location = useLocation();
    const authState = getAuthState();

    if (guestOnly) {
        if (authState.isAuthenticated) {
            return <Navigate to={getDashboardPath(authState.role)} replace />;
        }

        return <Outlet />;
    }

    if (allowedRoles) {
        if (!authState.isAuthenticated) {
            return <Navigate to="/forbidden" replace state={{ from: location }} />;
        }

        if (authState.role && allowedRoles.includes(authState.role)) {
            return <Outlet />;
        }

        if (authState.role) {
            return <Navigate to="/forbidden" replace state={{ from: location }} />;
        }

        return <Navigate to="/forbidden" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;