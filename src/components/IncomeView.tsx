import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  TrendingUp,
  Plus,
  Calendar,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { soundFx } from '../services/sound';
import { INCOME_CATEGORIES } from '../data/categories';
import { Transaction } from '../types/finance';
import { EditTransactionModal } from './modals/EditTransactionModal';

interface Props {
  onOpenAddTx: () => void;
}

export const IncomeView: React.FC<Props> = ({ onOpenAddTx }) => {
  const { transactions, accounts, formatAmount, formatDate, deleteTransaction, profile } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Filter only income transactions
  const incomeTransactions = useMemo(() => {
    return transactions.filter(t => t.type === 'income');
  }, [transactions]);

  const filteredIncomes = useMemo(() => {
    return incomeTransactions.filter(t => {
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.payee.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [incomeTransactions, selectedCategory, searchQuery]);

  // Calculations
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthIncome = incomeTransactions
    .filter(t => t.date.startsWith(currentMonthPrefix))
    .reduce((s, t) => s + t.amount, 0);

  const totalAllTimeIncome = incomeTransactions.reduce((s, t) => s + t.amount, 0);
  const targetMonthly = profile.monthlyIncomeTarget || 35000;
  const targetProgress = Math.min(100, Math.round((thisMonthIncome / targetMonthly) * 100));

  // Category breakdown map
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    incomeTransactions.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [incomeTransactions]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <span>Income Streams & Earnings</span>
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
              Section 9 Spec
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor tuition income, tutoring classes, salary, and freelance revenue streams.
          </p>
        </div>

        <button
          onClick={onOpenAddTx}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Income (₹)</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Current Month's Earnings</span>
          <p className="text-2xl font-bold text-emerald-400 font-mono-numbers mt-1">
            {formatAmount(thisMonthIncome)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Monthly Target: {formatAmount(targetMonthly)}</span>
            <span className="font-semibold text-emerald-400">{targetProgress}%</span>
          </div>
          <div className="mt-1.5 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Total Lifetime Income</span>
          <p className="text-2xl font-bold text-white font-mono-numbers mt-1">
            {formatAmount(totalAllTimeIncome)}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            Across {incomeTransactions.length} recorded credit deposits
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Top Revenue Source</span>
          <p className="text-lg font-bold text-teal-300 truncate mt-1">
            {categoryTotals[0]?.[0] || 'Tuition Income'}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            {categoryTotals[0] ? formatAmount(categoryTotals[0][1]) : '—'} recorded
          </p>
        </div>
      </div>

      {/* 3. Category Breakdown Grid */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-3">Income Source Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {categoryTotals.map(([catName, amt]) => {
            const cat = INCOME_CATEGORIES.find(c => c.name === catName);
            const pct = totalAllTimeIncome > 0 ? Math.round((amt / totalAllTimeIncome) * 100) : 0;
            return (
              <div
                key={catName}
                onClick={() => setSelectedCategory(selectedCategory === catName ? 'ALL' : catName)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedCategory === catName
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat?.color || '#10B981' }}
                  />
                  <span className="text-xs font-semibold truncate">{catName}</span>
                </div>
                <p className="text-sm font-bold font-mono-numbers mt-2 text-white">
                  {formatAmount(amt)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{pct}% of earnings</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Income History Table with Add/Delete Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search income receipts..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="ALL">All Sources</option>
              {INCOME_CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description / Source</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Credited Account</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredIncomes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                    No income records found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredIncomes.map(item => {
                  const acc = accounts.find(a => a.id === item.accountId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-100">
                        {item.payee}
                        {item.note && <span className="block text-[10px] font-normal text-slate-400">{item.note}</span>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {acc?.name || 'Account'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {item.paymentMethod || 'UPI'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-numbers font-bold text-emerald-400 text-sm whitespace-nowrap">
                        +{formatAmount(item.amount)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingTx(item);
                              soundFx.playPop();
                            }}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="Edit income entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete income record "${item.payee}" of ${formatAmount(item.amount)}?`)) {
                                deleteTransaction(item.id);
                                soundFx.playPop();
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete income entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Income Modal */}
      {editingTx && (
        <EditTransactionModal
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
        />
      )}
    </div>
  );
};
