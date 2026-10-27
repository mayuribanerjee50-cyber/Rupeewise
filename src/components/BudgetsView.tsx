import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Edit2,
  Trash2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { soundFx } from '../services/sound';
import { EXPENSE_CATEGORIES } from '../data/categories';

export const BudgetsView: React.FC = () => {
  const { budgets, transactions, formatAmount, addBudget, updateBudget, deleteBudget, profile } = useFinance();

  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetCategory, setBudgetCategory] = useState(EXPENSE_CATEGORIES[0]?.name || 'Food and groceries');
  const [budgetLimit, setBudgetLimit] = useState('5000');
  const [carryForward, setCarryForward] = useState(false);

  // Current month expenses per category
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthExpenses = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentMonth) && t.type === 'expense');
  }, [transactions, currentMonth]);

  const prevMonthExpenses = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(prevMonth) && t.type === 'expense');
  }, [transactions, prevMonth]);

  // Overall totals
  const totalBudgetLimit = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalActualSpent = currentMonthExpenses.reduce((s, t) => s + t.amount, 0);
  const totalRemaining = Math.max(0, totalBudgetLimit - totalActualSpent);
  const overallUtilisation = totalBudgetLimit > 0 ? Math.round((totalActualSpent / totalBudgetLimit) * 100) : 0;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(budgetLimit);
    if (isNaN(limit) || limit <= 0) return;

    if (editingBudgetId) {
      const existing = budgets.find(b => b.id === editingBudgetId);
      if (existing) {
        updateBudget({
          ...existing,
          category: budgetCategory,
          monthlyLimit: limit,
          carryForward,
        });
      }
    } else {
      addBudget({
        category: budgetCategory,
        monthlyLimit: limit,
        color: EXPENSE_CATEGORIES.find(c => c.name === budgetCategory)?.color || '#6366F1',
        carryForward,
      });
    }

    soundFx.playSuccess();
    setIsAddBudgetOpen(false);
    setEditingBudgetId(null);
    setBudgetLimit('5000');
  };

  const handleEditClick = (b: typeof budgets[0]) => {
    setEditingBudgetId(b.id);
    setBudgetCategory(b.category);
    setBudgetLimit(String(b.monthlyLimit));
    setCarryForward(b.carryForward || false);
    setIsAddBudgetOpen(true);
    soundFx.playPop();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <PieChart className="w-6 h-6 text-amber-400" />
              <span>Budget Management & Limits</span>
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
              Section 12 Spec
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Set category allowances, monitor utilisation thresholds (75%, 90%, 100%), and prevent overspending.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBudgetId(null);
            setIsAddBudgetOpen(true);
            soundFx.playPop();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category Budget (₹)</span>
        </button>
      </div>

      {/* 2. Overall Budget Health Bar */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400">Total Monthly Budget Utilization</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-white font-mono-numbers">
                {formatAmount(totalActualSpent)}
              </span>
              <span className="text-sm text-slate-400 font-mono-numbers">
                / {formatAmount(totalBudgetLimit)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div>
              <span className="text-slate-400 block text-[10px]">Remaining</span>
              <span className="text-emerald-400 font-mono-numbers text-sm">
                {formatAmount(totalRemaining)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Utilized</span>
              <span
                className={`text-sm font-mono-numbers ${
                  overallUtilisation >= 100
                    ? 'text-rose-400'
                    : overallUtilisation >= 75
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {overallUtilisation}%
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all ${
              overallUtilisation >= 100
                ? 'bg-rose-500'
                : overallUtilisation >= 90
                ? 'bg-orange-500'
                : overallUtilisation >= 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, overallUtilisation)}%` }}
          />
        </div>
      </div>

      {/* 3. Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map(budget => {
          const actualSpent = currentMonthExpenses
            .filter(t => t.category === budget.category)
            .reduce((s, t) => s + t.amount, 0);

          const prevSpent = prevMonthExpenses
            .filter(t => t.category === budget.category)
            .reduce((s, t) => s + t.amount, 0);

          const pct = budget.monthlyLimit > 0 ? Math.round((actualSpent / budget.monthlyLimit) * 100) : 0;
          const remaining = Math.max(0, budget.monthlyLimit - actualSpent);

          // Warnings thresholds (75%, 90%, 100% as mandated in Section 12)
          const isOverBudget = pct >= 100;
          const isCritical = pct >= 90 && pct < 100;
          const isWarning = pct >= 75 && pct < 90;

          return (
            <div
              key={budget.id}
              className={`p-4 rounded-xl bg-slate-900/80 border transition-all ${
                isOverBudget
                  ? 'border-rose-500/50 shadow-sm shadow-rose-500/10'
                  : isCritical
                  ? 'border-orange-500/40'
                  : isWarning
                  ? 'border-amber-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{budget.category}</h4>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {isOverBudget && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>100% Exceeded</span>
                      </span>
                    )}
                    {isCritical && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>90% Critical Alert</span>
                      </span>
                    )}
                    {isWarning && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>75% Warning</span>
                      </span>
                    )}
                    {!isWarning && !isCritical && !isOverBudget && (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>On Track</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditClick(budget)}
                    className="p-1 text-slate-400 hover:text-white rounded"
                    title="Edit limit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      deleteBudget(budget.id);
                      soundFx.playPop();
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded"
                    title="Delete budget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Numbers */}
              <div className="mt-4 flex items-baseline justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Spent this month</span>
                  <span
                    className={`text-base font-bold font-mono-numbers ${
                      isOverBudget ? 'text-rose-400' : 'text-slate-100'
                    }`}
                  >
                    {formatAmount(actualSpent)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Limit</span>
                  <span className="text-sm font-semibold text-slate-300 font-mono-numbers">
                    {formatAmount(budget.monthlyLimit)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2 w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverBudget
                      ? 'bg-rose-500'
                      : isCritical
                      ? 'bg-orange-500'
                      : isWarning
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>{pct}% utilized</span>
                <span>
                  {isOverBudget ? (
                    <strong className="text-rose-400">Over by {formatAmount(actualSpent - budget.monthlyLimit)}</strong>
                  ) : (
                    `Remaining: ${formatAmount(remaining)}`
                  )}
                </span>
              </div>

              {prevSpent > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800/50 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Last month spent:</span>
                  <span className="font-mono-numbers">{formatAmount(prevSpent)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Budget Modal */}
      {isAddBudgetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-400" />
              <span>{editingBudgetId ? 'Edit Category Budget' : 'Add Monthly Budget'}</span>
            </h3>

            <form onSubmit={handleSaveBudget} className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Expense Category</label>
                <select
                  value={budgetCategory}
                  onChange={e => setBudgetCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Monthly Spending Limit (₹) *</label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={budgetLimit}
                  onChange={e => setBudgetLimit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono-numbers"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="carryForward"
                  checked={carryForward}
                  onChange={e => setCarryForward(e.target.checked)}
                  className="rounded border-slate-800 text-amber-500 focus:ring-0"
                />
                <label htmlFor="carryForward" className="text-xs text-slate-300">
                  Enable optional carry-forward for unused budget balance
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBudgetOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Save Budget Limit (₹)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
