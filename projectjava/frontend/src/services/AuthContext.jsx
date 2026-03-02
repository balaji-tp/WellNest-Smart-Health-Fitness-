import React, { createContext, useState, useEffect } from 'react';
import api from './api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('auth/signin', { username, password });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data));
                setUser(response.data);
            }
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const googleLogin = async (token) => {
        try {
            const response = await api.post('auth/google', { token });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data));
                setUser(response.data);
            }
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Google Sign-In failed';
        }
    };

    const register = async (username, email, password, role) => {
        try {
            const response = await api.post('auth/signup', { username, email, password, role });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, googleLogin, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
