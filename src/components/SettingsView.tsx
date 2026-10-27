import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Settings,
  User,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Download,
  Calendar,
  Save,
  CheckCircle2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { soundFx } from '../services/sound';
import { BUDGETING_METHODS } from '../data/categories';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, loadDemoData, clearDemoData, resetDemoData, formatAmount } = useFinance();

  const [fullName, setFullName] = useState(profile.fullName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState(String(profile.monthlyIncomeTarget || 35000));
  const [initialSavingsBalance, setInitialSavingsBalance] = useState(String(profile.initialSavingsBalance || 20000));
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState(String(profile.monthlySavingsGoal || 10000));
  const [budgetingMethod, setBudgetingMethod] = useState(profile.budgetingMethod || '50/30/20 Rule');
  const [financialYearStart, setFinancialYearStart] = useState(profile.financialYearStart || 'April');
  const [monthlyExpenseBudget, setMonthlyExpenseBudget] = useState(String(profile.monthlyExpenseBudget || 22000));
  const [shortTermGoal, setShortTermGoal] = useState(profile.shortTermGoal || '');
  const [longTermGoal, setLongTermGoal] = useState(profile.longTermGoal || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
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

    soundFx.playSuccess();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-400" />
            <span>Profile & System Configuration</span>
          </h1>
          <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
            Section 4 Spec
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure financial goals, budgeting methodologies, and demo datasets.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile configuration saved successfully!</span>
        </div>
      )}

      {/* 2. User Profile & Preferences Form (Section 4) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Student / Scholar Profile</h3>
            <p className="text-xs text-slate-400">Personalize display name, financial targets, and budgeting method</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Account / Profile Name (Optional)</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Optional (No name needed)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Email Address (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. student@college.edu"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Monthly Income Target (₹)</label>
              <input
                type="number"
                min="0"
                value={monthlyIncomeTarget}
                onChange={e => setMonthlyIncomeTarget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono-numbers"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Monthly Expense Budget (₹)</label>
              <input
                type="number"
                min="0"
                value={monthlyExpenseBudget}
                onChange={e => setMonthlyExpenseBudget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono-numbers"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Monthly Savings Goal (₹)</label>
              <input
                type="number"
                min="0"
                value={monthlySavingsGoal}
                onChange={e => setMonthlySavingsGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono-numbers"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Preferred Budgeting Method</label>
              <select
                value={budgetingMethod}
                onChange={e => setBudgetingMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              >
                {BUDGETING_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Financial Year Start Month</label>
              <select
                value={financialYearStart}
                onChange={e => setFinancialYearStart(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              >
                <option value="April">April (Standard Indian Financial Year)</option>
                <option value="January">January (Calendar Year)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Short-Term Financial Goal</label>
              <input
                type="text"
                value={shortTermGoal}
                onChange={e => setShortTermGoal(e.target.value)}
                placeholder="e.g. 3-month emergency reserve"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Long-Term Financial Goal</label>
              <input
                type="text"
                value={longTermGoal}
                onChange={e => setLongTermGoal(e.target.value)}
                placeholder="e.g. Higher education fund"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Demo Dataset Controls (Section 18) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <h3 className="text-sm font-bold text-white mb-1">Sample Data & Demo Mode (Section 18)</h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Prepopulated with plausible college finance records (Tuition ₹9,000, Tutoring ₹2,500, Groceries ₹1,500, Commute ₹800).
          Use these controls to reset demo records for live evaluation or start with a clean slate.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              loadDemoData();
              soundFx.playCoin();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Load / Reset Demo Data</span>
          </button>

          <button
            onClick={() => {
              if (clearConfirm) {
                clearDemoData();
                soundFx.playPop();
                setClearConfirm(false);
              } else {
                setClearConfirm(true);
                setTimeout(() => setClearConfirm(false), 4000);
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
              clearConfirm
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{clearConfirm ? 'Confirm Clear All Data?' : 'Clear All Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
