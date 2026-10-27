import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  TrendingDown,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  PieChart as PieIcon,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { soundFx } from '../services/sound';
import { EXPENSE_CATEGORIES } from '../data/categories';
import { Transaction } from '../types/finance';
import { EditTransactionModal } from './modals/EditTransactionModal';

interface Props {
  onOpenAddTx: () => void;
}

export const ExpensesView: React.FC<Props> = ({ onOpenAddTx }) => {
  const { transactions, accounts, formatAmount, formatDate, deleteTransaction, kpis } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Filter only expenses
  const expenseTransactions = useMemo(() => {
    return transactions.filter(t => t.type === 'expense');
  }, [transactions]);

  const filteredExpenses = useMemo(() => {
    return expenseTransactions.filter(t => {
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.payee.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [expenseTransactions, selectedCategory, searchQuery]);

  // Largest individual expense
  const largestIndividualExpense = useMemo(() => {
    if (expenseTransactions.length === 0) return null;
    return [...expenseTransactions].sort((a, b) => b.amount - a.amount)[0];
  }, [expenseTransactions]);

  // Category breakdown map
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    expenseTransactions.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenseTransactions]);

  // Data-backed practical insights (Section 10)
  const expenseInsights = useMemo(() => {
    const list: string[] = [];
    const now = new Date();
    const curPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevPrefix = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const curMonthExpenses = expenseTransactions.filter(t => t.date.startsWith(curPrefix));
    const prevMonthExpenses = expenseTransactions.filter(t => t.date.startsWith(prevPrefix));

    // Category delta comparison
    EXPENSE_CATEGORIES.forEach(cat => {
      const curAmt = curMonthExpenses.filter(t => t.category === cat.name).reduce((s, t) => s + t.amount, 0);
      const prevAmt = prevMonthExpenses.filter(t => t.category === cat.name).reduce((s, t) => s + t.amount, 0);
      if (curAmt > prevAmt && prevAmt > 0) {
        const diff = curAmt - prevAmt;
        list.push(`You spent ₹${diff.toLocaleString('en-IN')} more on ${cat.name} this month than last month.`);
      }
    });

    if (list.length === 0 && categoryTotals.length > 0) {
      list.push(`${categoryTotals[0][0]} accounts for the highest share of your expenditure at ₹${categoryTotals[0][1].toLocaleString('en-IN')}.`);
    }

    return list;
  }, [expenseTransactions, categoryTotals]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-rose-400" />
              <span>Expense Analysis & Outflows</span>
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md">
              Section 10 Spec
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Category breakdowns, fixed vs variable, essential vs discretionary, and average daily burn rate.
          </p>
        </div>

        <button
          onClick={onOpenAddTx}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-semibold text-xs shadow-md shadow-rose-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense (₹)</span>
        </button>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">This Month's Spending</span>
          <p className="text-xl font-bold text-rose-400 font-mono-numbers mt-1">
            {formatAmount(kpis.currentMonthExpenses)}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Avg ₹{kpis.averageDailyExpense} / day
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Highest Category</span>
          <p className="text-xl font-bold text-amber-400 truncate mt-1">
            {kpis.highestExpenseCategory}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Primary expenditure driver
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Fixed vs Variable</span>
          <p className="text-sm font-bold text-slate-200 mt-1 font-mono-numbers">
            ₹{kpis.fixedExpenseTotal.toLocaleString('en-IN')} <span className="text-slate-500">/</span> ₹{kpis.variableExpenseTotal.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Fixed commitments vs Variable burn
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Essential vs Discretionary</span>
          <p className="text-sm font-bold text-slate-200 mt-1 font-mono-numbers">
            ₹{kpis.essentialTotal.toLocaleString('en-IN')} <span className="text-slate-500">/</span> ₹{kpis.discretionaryTotal.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Needs (Food, Rent) vs Wants (Fun)
          </p>
        </div>
      </div>

      {/* 3. Practical Data-Driven Insights (Section 10) */}
      {expenseInsights.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-white">Data-Backed Spending Insights</h4>
            {expenseInsights.map((ins, i) => (
              <p key={i} className="text-xs text-slate-300">
                • {ins}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 4. Category Breakdown Chips */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-3">Expenditure by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {categoryTotals.map(([catName, amt]) => {
            const cat = EXPENSE_CATEGORIES.find(c => c.name === catName);
            const isSelected = selectedCategory === catName;
            return (
              <div
                key={catName}
                onClick={() => setSelectedCategory(isSelected ? 'ALL' : catName)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat?.color || '#F43F5E' }}
                  />
                  <span className="text-xs font-semibold truncate">{catName}</span>
                </div>
                <p className="text-sm font-bold font-mono-numbers mt-2 text-white">
                  {formatAmount(amt)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Expense Records Stream */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search expenses, payees..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="ALL">All Categories</option>
              {EXPENSE_CATEGORIES.map(c => (
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
                <th className="py-3 px-4">Payee / Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                    No expense records found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(item => {
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
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {acc?.name || 'Account'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {item.paymentMethod || 'UPI'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-numbers font-bold text-rose-400 text-sm whitespace-nowrap">
                        −{formatAmount(item.amount)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingTx(item);
                              soundFx.playPop();
                            }}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="Edit expense entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete expense record "${item.payee}" of ${formatAmount(item.amount)}?`)) {
                                deleteTransaction(item.id);
                                soundFx.playPop();
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete expense entry"
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

      {/* Edit Expense Modal */}
      {editingTx && (
        <EditTransactionModal
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
        />
      )}
    </div>
  );
};
