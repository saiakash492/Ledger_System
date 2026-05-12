import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex bg-bg-light dark:bg-bg-dark h-[100vh] items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
