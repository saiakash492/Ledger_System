import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, User, Menu } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary-600 p-2 rounded-xl group-hover:bg-primary-500 transition-colors">
                            <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                            Ledger
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    {user ? (
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-sm font-medium hover:text-primary-600 transition-colors">Dashboard</Link>
                            <Link to="/transactions" className="text-sm font-medium hover:text-primary-600 transition-colors">Transactions</Link>
                            
                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                            
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-500 flex items-center gap-2">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                                        <User className="h-4 w-4" />
                                    </div>
                                    {user.email}
                                </span>
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-2 rounded-lg transition-colors font-medium"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/login" className="text-sm font-medium hover:text-primary-600 px-4 py-2 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-primary-500/25">
                                Get Started
                            </Link>
                        </div>
                    )}

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-2">
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
