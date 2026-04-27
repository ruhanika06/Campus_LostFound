import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Search, PlusCircle, User, Home as HomeIcon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src="https://www.thapar.edu/images/logo.png" alt="Thapar Logo" />
                </Link>
                <div className="nav-links">
                    <Link to="/" className="nav-item">
                        <HomeIcon size={20} /> Home
                    </Link>
                    <Link to="/items" className="nav-item">
                        <Search size={20} /> Browse
                    </Link>
                    {user ? (
                        <>
                            <Link to="/report" className="nav-item">
                                <PlusCircle size={20} /> Report
                            </Link>
                            <Link to="/dashboard" className="nav-item">
                                <User size={20} /> Dashboard
                            </Link>
                            <button onClick={handleLogout} className="nav-btn logout">
                                <LogOut size={20} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-btn login">Login</Link>
                            <Link to="/register" className="nav-btn register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
