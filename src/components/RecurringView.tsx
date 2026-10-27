import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Repeat,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Trash2,
  Edit2,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { soundFx } from '../services/sound';
import { RecurringItem } from '../types/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/categories';

export const RecurringView: React.FC = () => {
  const {
    recurring,
    accounts,
    formatAmount,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    confirmRecurringTransaction,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('1000');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'daily' | 'yearly'>('monthly');
  const [dueDay, setDueDay] = useState('5');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]?.name || 'Housing and utilities');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [autoPay, setAutoPay] = useState(false);

  const handleCreateRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    const day = parseInt(dueDay, 10);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;

    addRecurring({
      name: name.trim(),
      type,
      amount: amt,
      frequency,
      dueDay: isNaN(day) ? 1 : Math.max(1, Math.min(31, day)),
      category,
      accountId: accountId || accounts[0]?.id || 'acc-1',
      autoPay,
      active: true,
      paidThisMonth: false,
    });

    soundFx.playSuccess();
    setIsAddModalOpen(false);
    setName('');
    setAmount('1000');
  };

  const handleToggleActive = (item: RecurringItem) => {
    updateRecurring({ ...item, active: item.active === false });
    soundFx.playPop();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Repeat className="w-6 h-6 text-purple-400" />
              <span>Recurring Transactions & Schedules</span>
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md">
              Section 14 Spec
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage tuition stipends, college fees, rent, broadband, and subscriptions with user confirmation audits.
          </p>
        </div>

        <button
          onClick={() => { setIsAddModalOpen(true); soundFx.playPop(); }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-semibold text-xs shadow-md shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Schedule (₹)</span>
        </button>
      </div>

      {/* 2. Commitments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurring.map(item => {
          const acc = accounts.find(a => a.id === item.accountId);
          const isIncome = item.type === 'income';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl bg-slate-900/80 border transition-all flex flex-col justify-between ${
                item.active === false ? 'opacity-60 border-slate-800' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isIncome ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {isIncome ? '+' : '−'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <p className="text-[10px] text-slate-400">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title={item.active === false ? 'Activate' : 'Pause'}
                    >
                      {item.active === false ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        deleteRecurring(item.id);
                        soundFx.playPop();
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded"
                      title="Delete schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Scheduled Amount</span>
                    <span
                      className={`text-xl font-bold font-mono-numbers ${
                        isIncome ? 'text-emerald-400' : 'text-purple-300'
                      }`}
                    >
                      {formatAmount(item.amount)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Frequency</span>
                    <span className="text-xs font-semibold text-slate-200 capitalize">
                      {item.frequency} (Day {item.dueDay})
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{acc?.name || 'Account'}</span>

                {item.paidThisMonth ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Recorded This Month</span>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      confirmRecurringTransaction(item.id);
                      soundFx.playCoin();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Due Transaction</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Recurring Schedule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Repeat className="w-5 h-5 text-purple-400" />
              <span>Create Recurring Commitment</span>
            </h3>

            <form onSubmit={handleCreateRecurring} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Commitment Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Broadband Bill, Gym, Tuition Stipend"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="expense">Expense (Outflow)</option>
                    <option value="income">Income (Inflow)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono-numbers"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Day of Month (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={e => setDueDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Associated Account</label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatAmount(a.balance)})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs"
                >
                  Save Schedule (₹)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
