import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { History, Download, Upload, Send, AlertCircle } from 'lucide-react';

const Transactions = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await api.get('/accounts/all');
                setAccounts(response.data);
                if (response.data.length > 0) {
                    setSelectedAccount(response.data[0].account_number);
                }
            } catch (err) {
                if (err.response?.status !== 404) {
                    setError('Failed to load accounts.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (!selectedAccount) return;

        const fetchHistory = async () => {
            setHistoryLoading(true);
            try {
                const response = await api.get(`/transactions/${selectedAccount}/history?limit=50&offset=0`);
                setHistory(response.data.transactions || []);
            } catch (err) {
                console.error(err);
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchHistory();
    }, [selectedAccount]);

    const formatDate = (dateString) => {
        const utcDateStr = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        const date = new Date(utcDateStr);
        return date.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true,
        });
    };

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

    const currentAccountCurrency = accounts.find((a) => a.account_number === selectedAccount)?.currency;

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'deposit':
                return <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg"><Download size={18} strokeWidth={2.5} /></div>;
            case 'withdrawal':
                return <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg"><Upload size={18} strokeWidth={2.5} /></div>;
            case 'transfer_out':
            case 'transfer_in':
                return <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Send size={18} /></div>;
            default:
                return <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg"><History size={18} /></div>;
        }
    };

    const getTransactionColor = (tx) => {
        if (['deposit', 'transfer_in'].includes(tx.type)) return 'text-green-600 dark:text-green-400';
        if (['withdrawal', 'transfer_out', 'withdraw'].includes(tx.type)) return 'text-red-600 dark:text-red-400';
        if (tx.type === 'transfer') {
            return tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        }
        return 'text-slate-900 dark:text-white';
    };

    const getTransactionSign = (tx) => {
        if (['deposit', 'transfer_in'].includes(tx.type)) return '+';
        if (['withdrawal', 'transfer_out', 'withdraw'].includes(tx.type)) return '-';
        if (tx.type === 'transfer') {
            return tx.amount > 0 ? '+' : '-';
        }
        return '';
    };

    const formatType = (type) => type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Transaction History</h1>
                        <p className="text-slate-500">View and track all your ledger movements</p>
                    </div>

                    {!loading && accounts.length > 0 && (
                        <div className="w-full md:w-72 mt-4 md:mt-0">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Select Account</label>
                            <select
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-mono"
                            >
                                {accounts.map((acc) => (
                                    <option key={acc.account_number} value={acc.account_number}>
                                        {acc.account_number} ({getCurrencyLabel(acc.currency)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="glass-card h-20 animate-pulse bg-white/40 dark:bg-slate-800/40"></div>
                        ))}
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="glass-card p-12 text-center text-slate-500">
                        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p>You don't have any accounts yet. Create one from the Dashboard.</p>
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        {error && <div className="p-4 bg-red-50 text-red-600 border-b border-red-100">{error}</div>}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-sm tracking-wide text-slate-500">
                                        <th className="px-6 py-4 font-semibold">Transaction</th>
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {historyLoading ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center">
                                                <div className="mx-auto w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                            </td>
                                        </tr>
                                    ) : history.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                                No transactions found for this account.
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((tx, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        {getTransactionIcon(tx.type)}
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{formatType(tx.type)}</p>
                                                            {tx.counterparty_account && tx.counterparty_account !== 'SYSTEM' && (
                                                                <p className="text-xs text-slate-400 mt-1">
                                                                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mr-1">
                                                                        {tx.type === 'transfer' && tx.amount > 0 ? 'From:' : 'To:'}
                                                                    </span>
                                                                    <span className="font-mono text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                                                                        {tx.counterparty_account}
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{formatDate(tx.timestamp)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        COMPLETED
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-medium text-lg ${getTransactionColor(tx)}`}>
                                                    {getTransactionSign(tx)}{getCurrencySymbol(currentAccountCurrency)}{Math.abs(tx.amount)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Transactions;
