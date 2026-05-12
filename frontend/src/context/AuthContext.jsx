import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userEmail = localStorage.getItem('user_email');
        const userId = localStorage.getItem('user_id');
        
        if (token && userEmail) {
            setUser({ email: userEmail, id: userId });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            // Provide parameters as form-urlencoded according to OAuth2PasswordRequestForm
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const { data } = await api.post('/token', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            localStorage.setItem('access_token', data.access_token);
            // Assuming the token sub contains email, we can't decode it perfectly without jwt-decode, 
            // but we can just store the credentials manually for now
            localStorage.setItem('user_email', username);
            setUser({ email: username });
            
            return true;
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            await api.post('/users/', {
                name,
                email,
                password
            });
            return true;
        } catch (error) {
            console.error('Signup failed', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_id');
        setUser(null);
    };

    const value = {
        user,
        setUser,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
