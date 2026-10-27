import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  User,
  Wallet,
  Target,
  PieChart,
  X,
} from 'lucide-react';
import { BUDGETING_METHODS } from '../../data/categories';
import { soundFx } from '../../services/sound';

export const FirstLaunchSetupModal: React.FC = () => {
  const { isFirstSetupOpen, completeFirstSetup, profile } = useFinance();

  const [fullName, setFullName] = useState(profile.fullName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState(String(profile.monthlyIncomeTarget || 35000));
  const [initialSavingsBalance, setInitialSavingsBalance] = useState(String(profile.initialSavingsBalance || 20000));
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState(String(profile.monthlySavingsGoal || 10000));
  const [budgetingMethod, setBudgetingMethod] = useState(profile.budgetingMethod || '50/30/20 Rule');
  const [financialYearStart, setFinancialYearStart] = useState(profile.financialYearStart || 'April');
  const [monthlyExpenseBudget, setMonthlyExpenseBudget] = useState(String(profile.monthlyExpenseBudget || 22000));
  const [shortTermGoal, setShortTermGoal] = useState(profile.shortTermGoal || 'Emergency fund reserve');
  const [longTermGoal, setLongTermGoal] = useState(profile.longTermGoal || 'Higher education & mutual funds');

  if (!isFirstSetupOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();
    completeFirstSetup({
      fullName: fullName.trim(),
      email: email.trim(),
      monthlyIncomeTarget: parseFloat(monthlyIncomeTarget) || 35000,
      initialSavingsBalance: parseFloat(initialSavingsBalance) || 20000,
      monthlySavingsGoal: parseFloat(monthlySavingsGoal) || 10000,
      budgetingMethod,
      financialYearStart,
      monthlyExpenseBudget: parseFloat(monthlyExpenseBudget) || 22000,
      shortTermGoal: shortTermGoal.trim(),
      longTermGoal: longTermGoal.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20">
              ₹
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Welcome to RupeeWise</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  Setup
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Personal Finance & Management System • Java 21 • Indian Rupees (INR)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              completeFirstSetup(profile);
              soundFx.playPop();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Skip and use defaults"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mt-4 leading-relaxed">
          Configure your student finance profile and monthly targets. You can edit these anytime from the Settings page. No real credentials or sensitive information are ever requested.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">Account / Profile Name (Optional)</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Optional (No name needed)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. student@college.edu"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">Monthly Income (₹)</label>
              <input
                type="number"
                min="0"
                value={monthlyIncomeTarget}
                onChange={e => setMonthlyIncomeTarget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono-numbers"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">Monthly Budget (₹)</label>
              <input
                type="number"
                min="0"
                value={monthlyExpenseBudget}
                onChange={e => setMonthlyExpenseBudget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono-numbers"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">Savings Goal (₹)</label>
              <input
                type="number"
                min="0"
                value={monthlySavingsGoal}
                onChange={e => setMonthlySavingsGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono-numbers"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">Budgeting Method</label>
              <select
                value={budgetingMethod}
                onChange={e => setBudgetingMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              >
                {BUDGETING_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">Financial Year Start</label>
              <select
                value={financialYearStart}
                onChange={e => setFinancialYearStart(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="April">April (Indian Financial Year Standard)</option>
                <option value="January">January (Calendar Year)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 space-y-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01]"
            >
              <span>Get Started with RupeeWise</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => {
                completeFirstSetup(profile);
                soundFx.playPop();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
            >
              Skip setup & explore with sample data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
