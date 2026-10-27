import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AccountType } from '../../types/finance';
import { X, Landmark } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAccountModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addAccount } = useFinance();
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [balance, setBalance] = useState('');
  const [mask, setMask] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(balance);
    if (isNaN(bal) || !name.trim()) return;

    const colors: Record<AccountType, string> = {
      checking: '#3B82F6',
      savings: '#10B981',
      investment: '#6366F1',
      credit: '#F59E0B',
      cash: '#14B8A6',
    };

    addAccount({
      name: name.trim(),
      institution: institution.trim() || 'Bank',
      type,
      balance: bal,
      currency: 'USD',
      accountNumberMask: mask.trim() ? `•••• ${mask.trim()}` : undefined,
      color: colors[type] || '#3B82F6',
    });

    setName('');
    setInstitution('');
    setBalance('');
    setMask('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">Add Financial Account</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Account Nickname</label>
            <input
              type="text"
              required
              placeholder="e.g. Daily Checking, Tech Stock Portfolio"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Institution</label>
              <input
                type="text"
                placeholder="e.g. SBI, HDFC, ICICI, Zerodha"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Account Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as AccountType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="checking">Checking / Current</option>
                <option value="savings">Savings Account</option>
                <option value="investment">Demate / Mutual Fund / Stocks</option>
                <option value="credit">Credit Card (Liability)</option>
                <option value="cash">Physical Cash / Wallet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {type === 'credit' ? 'Owed Balance (₹)' : 'Current Balance (₹)'}
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={balance}
                onChange={e => setBalance(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono-numbers focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Last 4 Digits (Optional)</label>
              <input
                type="text"
                maxLength={4}
                placeholder="e.g. 5184"
                value={mask}
                onChange={e => setMask(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono-numbers placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
