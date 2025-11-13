import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService, TokenManager } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        if (TokenManager.exists()) {
            try {
                const response = await ApiService.getMe();
                setUser(response.data);
            } catch (error) {
                TokenManager.clear();
                setUser(null);
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const response = await ApiService.login(email, password);
        TokenManager.set(response.data.access_token);
        
        const userResponse = await ApiService.getMe();
        setUser(userResponse.data);
        setLoading(false);
        
        setTimeout(() => navigate('/drops'), 0);
    };

    const signup = async (email, password) => {
        await ApiService.signup(email, password);
    };

    const logout = () => {
        TokenManager.clear();
        setUser(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

