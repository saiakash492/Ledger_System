import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            await register(name, email, password);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
                <div className="glass-card p-10 max-w-md w-full text-center space-y-4">
                    <div className="inline-flex bg-green-100 dark:bg-green-900/30 p-4 rounded-full text-green-600 mb-2">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Account Created!</h2>
                    <p className="text-slate-500">Your account has been successfully created. Redirecting to login...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-md z-10">
                <div className="glass-card p-8 md:p-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-6 drop-shadow-sm">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Create Account</h1>
                        <p className="text-slate-500 dark:text-slate-400">Join us to start managing your finances</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    minLength="6"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white py-3.5 px-4 rounded-xl font-medium transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                            Sign in instead
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
