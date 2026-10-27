import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../../data/categories';
import { Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { soundFx } from '../../services/sound';

interface Props {
  transaction: Transaction | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const EditTransactionModal: React.FC<Props> = ({ transaction, isOpen = true, onClose }) => {
  const { accounts, updateTransaction, deleteTransaction, formatAmount } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setPayee(transaction.payee || '');
      setAmount(String(transaction.amount || ''));
      setCategory(transaction.category || '');
      setAccountId(transaction.accountId || accounts[0]?.id || '');
      setTargetAccountId(transaction.targetAccountId || accounts[1]?.id || '');
      setPaymentMethod(transaction.paymentMethod || 'UPI');
      setDate(transaction.date || new Date().toISOString().split('T')[0]);
      setNote(transaction.note || '');
      setDeleteConfirm(false);
      setErrorMsg('');
    }
  }, [transaction, accounts]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!payee.trim()) {
      setErrorMsg('Please enter a description or payee name.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₹0.');
      return;
    }
    if (!accountId) {
      setErrorMsg('Please select an account.');
      return;
    }
    if (type === 'transfer' && accountId === targetAccountId) {
      setErrorMsg('Source and destination accounts cannot be identical.');
      return;
    }

    updateTransaction({
      ...transaction,
      type,
      payee: payee.trim(),
      amount: parsedAmount,
      category: category.trim() || (type === 'income' ? 'Tuition Income' : 'Food and groceries'),
      accountId,
      targetAccountId: type === 'transfer' ? targetAccountId : undefined,
      paymentMethod,
      date,
      note: note.trim(),
    });

    soundFx.playSuccess();
    onClose();
  };

  const handleDelete = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    soundFx.playPop();
    deleteTransaction(transaction.id);
    onClose();
  };

  const categories = type === 'income'
    ? INCOME_CATEGORIES.map(c => c.name)
    : EXPENSE_CATEGORIES.map(c => c.name);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Transaction</h3>
              <p className="text-[11px] text-slate-400 font-mono">ID: {transaction.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Type Selector Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Transaction Type</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory(EXPENSE_CATEGORIES[0]?.name || 'Food and groceries');
                  soundFx.playPop();
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expense (Debit)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory(INCOME_CATEGORIES[0]?.name || 'Tuition Income');
                  soundFx.playPop();
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Income (Credit)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('transfer');
                  setCategory('Transfer');
                  soundFx.playPop();
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  type === 'transfer'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Transfer
              </button>
            </div>
          </div>

          {/* Payee / Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Payee / Description *</label>
            <input
              type="text"
              value={payee}
              onChange={e => setPayee(e.target.value)}
              placeholder="e.g. Grocery Store, Scholarship, Bus Fare"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500"
              required
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Amount (₹) *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono-numbers focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Account & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {type === 'transfer' ? 'From Account (Debit) *' : 'Account *'}
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatAmount(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  To Destination Account (Credit) *
                </label>
                <select
                  value={targetAccountId}
                  onChange={e => setTargetAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatAmount(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Notes / Tags</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional memo or transaction note"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                deleteConfirm
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 animate-pulse'
                  : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleteConfirm ? 'Click to Confirm Delete' : 'Delete'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
