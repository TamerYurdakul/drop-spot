import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/drops" className="navbar-brand">
                    🎯 DropSpot
                </Link>
                <div className="navbar-menu">
                    <span className="navbar-user">{user.email}</span>
                    {user.role === 'admin' && (
                        <Link to="/admin">
                            <button className="btn btn-secondary">
                                Admin Panel
                            </button>
                        </Link>
                    )}
                    <button className="btn btn-danger" onClick={logout}>
                        Çıkış Yap
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

