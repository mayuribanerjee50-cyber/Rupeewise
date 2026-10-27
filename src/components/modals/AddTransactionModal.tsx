import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../../data/categories';
import { TransactionType } from '../../types/finance';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Check, Plus } from 'lucide-react';
import { soundFx } from '../../services/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export const AddTransactionModal: React.FC<Props> = ({ isOpen, onClose, defaultType = 'expense' }) => {
  const { accounts, addTransaction, addAccount, formatAmount } = useFinance();
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('1500');
  const [payee, setPayee] = useState<string>('');
  const [category, setCategory] = useState<string>(
    defaultType === 'income' ? INCOME_CATEGORIES[0].name : EXPENSE_CATEGORIES[0].name
  );
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [targetAccountId, setTargetAccountId] = useState<string>(accounts[1]?.id || accounts[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than zero.');
      return;
    }

    if (type === 'transfer' && accountId === targetAccountId) {
      setErrorMessage('Source and destination accounts must be distinct for transfers.');
      return;
    }

    let effectiveAccountId = accountId;
    if (accounts.length === 0) {
      addAccount({
        name: 'Primary SBI Account',
        type: 'savings',
        balance: 10000,
        currency: 'INR',
        institution: 'State Bank of India',
        color: '#10B981',
      });
      effectiveAccountId = `acc-${Date.now()}`;
    }

    addTransaction({
      amount: numAmount,
      type,
      category: type === 'transfer' ? 'Transfer' : category,
      accountId: effectiveAccountId || accounts[0]?.id || 'acc-1',
      targetAccountId: type === 'transfer' ? targetAccountId : undefined,
      payee: payee.trim() || (type === 'transfer' ? 'Inter-Account Transfer' : type === 'income' ? 'Income Deposit' : 'Expense Record'),
      paymentMethod,
      date,
      note: note.trim() || undefined,
      tags: tags.trim() || undefined,
      cleared: true,
    });

    soundFx.playCoin();
    onClose();
    setPayee('');
    setAmount('1500');
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Record Financial Transaction (₹)</span>
            </h2>
            <p className="text-[11px] text-slate-400">Enforces double-entry ledger updates & audit rules</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Type Selector */}
        <div className="mt-4 grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory(EXPENSE_CATEGORIES[0].name);
              soundFx.playPop();
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              type === 'expense'
                ? 'bg-rose-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Expense</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory(INCOME_CATEGORIES[0].name);
              soundFx.playPop();
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              type === 'income'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Income</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType('transfer');
              soundFx.playPop();
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              type === 'transfer'
                ? 'bg-blue-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transfer</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Amount (Indian Rupees ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-base font-bold text-white font-mono-numbers focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Payee / Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {type === 'income' ? 'Source / Payer *' : type === 'transfer' ? 'Transfer Memo' : 'Payee / Description *'}
            </label>
            <input
              type="text"
              value={payee}
              onChange={e => setPayee(e.target.value)}
              placeholder={
                type === 'income'
                  ? 'e.g. Tuition Stipend, Coding Tutoring, College Scholarship'
                  : type === 'transfer'
                  ? 'e.g. ATM Cash Withdrawal'
                  : 'e.g. Groceries, Campus Commute, Technical Books'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500"
              required
            />
          </div>

          {/* Category & Payment Method */}
          {type !== 'transfer' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Account Selection */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">From Account (Debit)</label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatAmount(a.balance)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">To Account (Credit)</label>
                <select
                  value={targetAccountId}
                  onChange={e => setTargetAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatAmount(a.balance)})</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {type === 'income' ? 'Deposit Into Account' : 'Paid From Account'}
                </label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatAmount(a.balance)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Transaction Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  required
                />
              </div>
            </div>
          )}

          {/* Notes & Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Receipt #1249"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Tags (Optional)</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="e.g. college, semester-4"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              Save Record (₹)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
