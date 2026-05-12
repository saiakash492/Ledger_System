import React, { useState } from 'react';
import { X, IndianRupee, Euro, PoundSterling, Send, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import api from '../api/axios';

const TransactionModal = ({ isOpen, onClose, type, account, allAccounts, onComplete }) => {
    const [amount, setAmount] = useState('');
    const [targetAccount, setTargetAccount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    if (!isOpen || !account) return null;

    const generateIdemKey = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        const currentAmount = parseFloat(amount);
        if (isNaN(currentAmount) || currentAmount <= 0) {
            setError('Please enter a valid positive amount.');
            setLoading(false);
            return;
        }

        try {
            const idemKey = generateIdemKey();
            if (type === 'deposit') {
                await api.post(`/transactions/deposit?account_number=${account.account_number}&amount=${currentAmount}&idem_key=${idemKey}`);
                setSuccessMsg('Deposit successful!');
            } else if (type === 'withdraw') {
                await api.post(`/transactions/withdraw?account_number=${account.account_number}&amount=${currentAmount}&key=${idemKey}`);
                setSuccessMsg('Withdrawal successful!');
            } else if (type === 'transfer') {
                if (!targetAccount) {
                    setError('Please specify a target account.');
                    setLoading(false);
                    return;
                }
                await api.post(`/transactions/transfer?to_account_number=${targetAccount}&accn_number=${account.account_number}&amount=${currentAmount}&key=${idemKey}`);
                setSuccessMsg('Transfer successful!');
            }
            
            setAmount('');
            setTargetAccount('');
            
            setTimeout(() => {
                onComplete();
                onClose();
            }, 1500);
            
        } catch (err) {
            setError(err.response?.data?.detail || `Failed to process ${type}.`);
        } finally {
            setLoading(false);
        }
    };

    const renderIcon = () => {
        if (type === 'deposit') return <ArrowDownRight className="w-6 h-6 text-green-500" />;
        if (type === 'withdraw') return <ArrowUpRight className="w-6 h-6 text-red-500" />;
        if (type === 'transfer') return <Send className="w-6 h-6 text-blue-500" />;
    };

    const renderCurrencyIcon = () => {
        const currency = account?.currency?.toUpperCase();
        if (currency === 'INR') return <IndianRupee className="h-5 w-5 text-slate-400" />;
        if (currency === 'EUR') return <Euro className="h-5 w-5 text-slate-400" />;
        if (currency === 'GBP') return <PoundSterling className="h-5 w-5 text-slate-400" />;
        return <IndianRupee className="h-5 w-5 text-slate-400" />;
    };

    const typeTitle = type.charAt(0).toUpperCase() + type.slice(1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md bg-white dark:bg-slate-900 overflow-hidden relative" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                            type === 'deposit' ? 'bg-green-100 dark:bg-green-900/30' :
                            type === 'withdraw' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                            {renderIcon()}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{typeTitle} Funds</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-sm tracking-wide text-slate-500 uppercase font-semibold mb-1">From Account</p>
                        <p className="text-lg font-mono text-slate-900 dark:text-white font-medium break-all">{account.account_number}</p>
                    </div>

                    {error && <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
                    {successMsg && <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">{successMsg}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Amount</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    {renderCurrencyIcon()}
                                </div>
                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {type === 'transfer' && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Recipient Account Number</label>
                                <input
                                    type="text"
                                    required
                                    value={targetAccount}
                                    onChange={(e) => setTargetAccount(e.target.value)}
                                    className="block w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-mono transition-all"
                                    placeholder="8xxxxxxxxxxxxx"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || successMsg !== ''}
                            className={`w-full mt-2 py-3.5 px-4 rounded-xl font-medium transition-all shadow-lg flex justify-center text-white
                                ${type === 'deposit' ? 'bg-green-600 hover:bg-green-500 shadow-green-500/30' : 
                                  type === 'withdraw' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/30' : 
                                  'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'} 
                                disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : `Confirm ${typeTitle}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TransactionModal;

