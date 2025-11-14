import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TokenManager } from './services/api';
import Navbar from './components/Navbar';
import Loading from './components/Loading';
import LoginPage from './pages/LoginPage';
import DropsListPage from './pages/DropsListPage';
import DropDetailPage from './pages/DropDetailPage';
import AdminPage from './pages/AdminPage';
import './styles/main.css';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/drops" replace />;
    }

    return children;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    if (user && TokenManager.exists()) {
        return <Navigate to="/drops" replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    } 
                />
                <Route 
                    path="/drops" 
                    element={
                        <ProtectedRoute>
                            <DropsListPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/drops/:id" 
                    element={
                        <ProtectedRoute>
                            <DropDetailPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="*" 
                    element={<Navigate to="/" replace />} 
                />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProviderWrapper>
                <AppRoutes />
            </AuthProviderWrapper>
        </BrowserRouter>
    );
}

// Wrapper to ensure AuthProvider is inside Router context
function AuthProviderWrapper({ children }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}

export default App;
