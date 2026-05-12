import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TransactionModal from '../components/TransactionModal';
import api from '../api/axios';
import { CreditCard, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, PlusCircle, Eye, EyeOff, Trash2 } from 'lucide-react';

const AccountCard = ({ account, onAction, onDeleteRequest }) => {
    const [showBalance, setShowBalance] = useState(false);
    const [balance, setBalance] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(false);

    const getCurrencySymbol = (currency) => {
        if (!currency) return '₹';
        if (currency.toUpperCase() !== 'EUR' && currency.toUpperCase() !== 'GBP') return '₹';
        if (currency.toUpperCase() === 'EUR') return '€';
        if (currency.toUpperCase() === 'GBP') return '£';
        return '₹';
    };

    const getCurrencyLabel = (currency) => {
        if (!currency) return 'INR';
        return currency.toUpperCase() === 'EUR' || currency.toUpperCase() === 'GBP'
            ? currency.toUpperCase()
            : 'INR';
    };

    const handleToggle = async () => {
        if (showBalance) {
            setShowBalance(false);
            return;
        }

        if (balance === null) {
            setLoadingBalance(true);
            try {
                const res = await api.get(`/transactions/balance?account_number=${account.account_number}`);
                setBalance(res.data.balance);
            } catch (err) {
                console.error('Failed to fetch balance', err);
                setBalance(0);
            } finally {
                setLoadingBalance(false);
            }
        }
        setShowBalance(true);
    };

    return (
        <div className="glass-card p-6 group hover:border-primary-500/50 transition-colors relative overflow-hidden flex flex-col h-full">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="bg-primary-50 dark:bg-primary-900/30 p-2.5 rounded-lg text-primary-600">
                    <CreditCard className="w-6 h-6" />
                </div>
                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {getCurrencyLabel(account.currency)}
                </div>
            </div>

            <div className="relative z-10 flex-1">
                <p className="text-sm text-slate-500 mb-1">Account Number</p>
                <p className="text-lg font-mono text-slate-900 dark:text-white font-medium break-all mb-4">
                    {account.account_number}
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-2 flex justify-between items-center border border-slate-100 dark:border-slate-700/50">
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Available Balance</p>
                        <div className="flex items-center gap-2">
                            {loadingBalance ? (
                                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                            ) : showBalance ? (
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {getCurrencySymbol(account.currency)}{' '}
                                    {balance !== null ? balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                </p>
                            ) : (
                                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-widest mt-1">
                                    ••••••
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleToggle}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                        title={showBalance ? 'Hide Balance' : 'Show Balance'}
                    >
                        {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 relative z-10">
                <button
                    onClick={() => onAction('deposit', account)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 text-sm font-medium transition-colors"
                >
                    <ArrowDownRight className="w-4 h-4" /> Deposit
                </button>
                <button
                    onClick={() => onAction('withdraw', account)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 text-sm font-medium transition-colors"
                >
                    <ArrowUpRight className="w-4 h-4" /> Withdraw
                </button>
                <button
                    onClick={() => onAction('transfer', account)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-sm font-medium transition-colors px-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> Send
                </button>
                <button
                    onClick={() => onDeleteRequest(account)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-900/40 text-slate-600 hover:text-red-700 dark:text-slate-300 dark:hover:text-red-300 text-sm font-medium transition-colors"
                    title="Delete Account"
                >
                    <Trash2 className="w-4 h-4" /> Delete
                </button>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('deposit');
    const [activeAccount, setActiveAccount] = useState(null);
    const [confirmToast, setConfirmToast] = useState(null);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/accounts/all');
            setAccounts(response.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch accounts:', err);
            if (err.response?.status !== 404) {
                setError('Could not load accounts. Please try again later.');
            } else {
                setAccounts([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleCreateAccount = async () => {
        try {
            setError('');
            await api.post('/accounts/create', { currency: 'INR' });
            fetchAccounts();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create account');
        }
    };

    const handleDeleteRequest = (account) => {
        setConfirmToast({
            accountNumber: account.account_number,
            message: `Delete account ${account.account_number}? This cannot be undone.`,
        });
    };

    const handleDeleteConfirm = async () => {
        if (!confirmToast) return;
        try {
            await api.delete(`/accounts/${confirmToast.accountNumber}`);
            setConfirmToast(null);
            fetchAccounts();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete account');
            setConfirmToast(null);
        }
    };

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
                        <p className="text-slate-500">Welcome back, {user?.email}!</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                <div className="mb-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Your Accounts</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={fetchAccounts}
                                disabled={loading}
                                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={handleCreateAccount}
                                disabled={loading}
                                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
                            >
                                <PlusCircle className="w-4 h-4" />
                                New Account
                            </button>
                        </div>
                    </div>

                    {loading && accounts.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="glass-card p-6 h-40 animate-pulse bg-white/40 dark:bg-slate-800/40"></div>
                            ))}
                        </div>
                    ) : accounts.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                <Wallet className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No accounts found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-6">You don't have any ledger accounts yet. Create one to start managing your assets.</p>
                            <button
                                onClick={handleCreateAccount}
                                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Create First Account
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {accounts.map((account) => (
                                <AccountCard
                                    key={account.account_number}
                                    account={account}
                                    onDeleteRequest={handleDeleteRequest}
                                    onAction={(kind, acc) => {
                                        setActiveAccount(acc);
                                        setModalType(kind);
                                        setIsModalOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <TransactionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    type={modalType}
                    account={activeAccount}
                    allAccounts={accounts}
                    onComplete={fetchAccounts}
                />

                {confirmToast && (
                    <div className="fixed inset-x-0 top-6 z-50 px-4">
                        <div className="mx-auto w-full max-w-2xl rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 shadow-xl p-4">
                            <p className="text-sm text-red-900 dark:text-red-100 mb-3">{confirmToast.message}</p>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setConfirmToast(null)}
                                    className="px-3 py-1.5 rounded-lg text-sm bg-white/80 hover:bg-white dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-800 dark:text-red-100 border border-red-200/70 dark:border-red-800/70"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="px-3 py-1.5 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
