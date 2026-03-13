/**
 * ProtectedRoute — redirects to /login if user is not authenticated.
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-chat-bg">
                <div className="loading-dots flex space-x-2">
                    <span className="w-3 h-3 bg-white rounded-full inline-block" />
                    <span className="w-3 h-3 bg-white rounded-full inline-block" />
                    <span className="w-3 h-3 bg-white rounded-full inline-block" />
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
