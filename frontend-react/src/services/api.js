import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Token Management
export const TokenManager = {
    set: (token) => localStorage.setItem('access_token', token),
    get: () => localStorage.getItem('access_token'),
    clear: () => localStorage.removeItem('access_token'),
    exists: () => !!localStorage.getItem('access_token')
};

// Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add token
api.interceptors.request.use(
    (config) => {
        const token = TokenManager.get();
        // Add token to all requests except login and signup
        const isPublicEndpoint = config.url.includes('/auth/login') || 
                                config.url.includes('/auth/signup');
        
        if (token && !isPublicEndpoint) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            TokenManager.clear();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// API Service
export const ApiService = {
    // Auth
    signup: (email, password) => 
        api.post('/auth/signup', { email, password }),
    
    login: (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        return api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    
    getMe: () => api.get('/auth/me'),
    
    // Drops
    getDrops: () => api.get('/drops/'),
    
    joinWaitlist: (dropId) => 
        api.post(`/drops/${dropId}/join`),
    
    leaveWaitlist: (dropId) => 
        api.post(`/drops/${dropId}/leave`),
    
    claimDrop: (dropId) => 
        api.post(`/drops/${dropId}/claim`),
    
    // Admin
    getAllDrops: () => api.get('/admin/drops'),
    
    getDrop: (dropId) => api.get(`/admin/drops/${dropId}`),
    
    createDrop: (dropData) => 
        api.post('/admin/drops', dropData),
    
    updateDrop: (dropId, dropData) => 
        api.put(`/admin/drops/${dropId}`, dropData),
    
    deleteDrop: (dropId) => 
        api.delete(`/admin/drops/${dropId}`)
};

export default api;
