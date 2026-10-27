import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { EXPENSE_CATEGORIES } from '../../data/categories';
import { X, PieChart } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddBudgetModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addBudget, budgets } = useFinance();
  const existingCategories = new Set(budgets.map(b => b.category));
  const availableCategories = EXPENSE_CATEGORIES.filter(c => !existingCategories.has(c.name));

  const [category, setCategory] = useState(availableCategories[0]?.name || EXPENSE_CATEGORIES[0].name);
  const [monthlyLimit, setMonthlyLimit] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    if (isNaN(limit) || limit <= 0) return;

    const matchedCat = EXPENSE_CATEGORIES.find(c => c.name === category);
    addBudget({
      category,
      monthlyLimit: limit,
      color: matchedCat?.color || '#6366F1',
    });

    setMonthlyLimit('');
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
            <PieChart className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Add Category Budget</h3>
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
            <label className="block text-xs font-medium text-slate-400 mb-1">Expense Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Spending Cap (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-mono-numbers text-lg font-bold">₹</span>
              <input
                type="number"
                step="100"
                required
                placeholder="10000"
                value={monthlyLimit}
                onChange={e => setMonthlyLimit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-4 py-2.5 text-lg font-semibold text-white font-mono-numbers focus:outline-hidden focus:border-indigo-500"
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
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
