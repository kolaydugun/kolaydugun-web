import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedTypes = ['couple', 'vendor'] }) => {
    const { user } = useAuth();

    console.log('ProtectedRoute Check:', JSON.stringify({
        userRole: user?.role,
        metaRole: user?.user_metadata?.role,
        allowedTypes,
        id: user?.id
    }, null, 2));

    if (!user) {
        // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
        return <Navigate to="/login" replace />;
    }

    if (user.role === 'admin' || user.user_metadata?.role === 'admin') {
        return children;
    }

    if (!allowedTypes.includes(user.role || user.user_metadata?.role)) {
        // Kullanıcı tipi uygun değilse ana sayfaya yönlendir
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
