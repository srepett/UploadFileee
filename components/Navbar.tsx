
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive ? 'bg-cyan-accent text-dark-bg' : 'text-gray-300 hover:bg-dark-surface hover:text-white'
        }`;

    return (
        <nav className="bg-dark-surface/80 backdrop-blur-sm shadow-lg fixed w-full z-10 top-0 border-b border-dark-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <NavLink to="/" className="flex-shrink-0 flex items-center gap-2">
                             <i className="fa-solid fa-cloud-arrow-up text-cyan-accent text-2xl"></i>
                            <span className="text-white text-xl font-bold">CyanFile</span>
                        </NavLink>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {user && <NavLink to="/" className={navLinkClass}>Upload</NavLink>}
                                {user && <NavLink to="/history" className={navLinkClass}>History</NavLink>}
                                {user && user.role === 'admin' && (
                                    <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                           {user ? (
                                <>
                                    <span className="text-gray-400 mr-4 text-sm">Welcome, {user.email}</span>
                                    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Logout
                                    </button>
                                </>
                           ) : (
                                <div className="space-x-2">
                                    <NavLink to="/login" className={navLinkClass}>Login</NavLink>
                                    <NavLink to="/register" className={navLinkClass}>Register</NavLink>
                                </div>
                           )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
