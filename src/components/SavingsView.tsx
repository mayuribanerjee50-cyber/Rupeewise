import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  PiggyBank,
  Plus,
  Target,
  TrendingUp,
  ShieldCheck,
  Calendar,
  AlertCircle,
  ArrowRight,
  Wallet,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { soundFx } from '../services/sound';

export const SavingsView: React.FC = () => {
  const {
    goals,
    accounts,
    formatAmount,
    formatDate,
    depositToGoal,
    addGoal,
    deleteGoal,
    kpis,
  } = useFinance();

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('2000');
  const [depositSourceAccountId, setDepositSourceAccountId] = useState<string>(accounts[0]?.id || '');

  // Add new goal modal state
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState('50000');
  const [goalCurrentAmount, setGoalCurrentAmount] = useState('0');
  const [goalDeadline, setGoalDeadline] = useState('2026-12-31');
  const [goalPriority, setGoalPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [goalNotes, setGoalNotes] = useState('');

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0 || !selectedGoalId) return;

    depositToGoal(selectedGoalId, amt, depositSourceAccountId);
    soundFx.playCoin();
    setIsDepositModalOpen(false);
    setDepositAmount('2000');
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTargetAmount);
    if (!goalName.trim() || isNaN(target) || target <= 0) return;

    addGoal({
      name: goalName.trim(),
      targetAmount: target,
      currentAmount: parseFloat(goalCurrentAmount) || 0,
      deadline: goalDeadline,
      category: 'Financial Goal',
      color: '#06B6D4',
      priority: goalPriority,
      notes: goalNotes.trim(),
    });

    soundFx.playSuccess();
    setIsAddGoalModalOpen(false);
    setGoalName('');
    setGoalTargetAmount('50000');
    setGoalNotes('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <PiggyBank className="w-6 h-6 text-cyan-400" />
              <span>Savings & Goal Reserves</span>
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md">
              Section 11 Spec
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Earmark funds for emergency funds, tech gear, and education without double-counting account assets.
          </p>
        </div>

        <button
          onClick={() => { setIsAddGoalModalOpen(true); soundFx.playPop(); }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal (₹)</span>
        </button>
      </div>

      {/* 2. Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Total Goals Accumulated</span>
          <p className="text-2xl font-bold text-cyan-400 font-mono-numbers mt-1">
            {formatAmount(kpis.totalSavings)}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            Dedicated savings reserves across all active targets
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Current Savings Rate</span>
          <p className="text-2xl font-bold text-emerald-400 font-mono-numbers mt-1">
            {kpis.savingsRate}%
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            (Income − Expenses) / Income ratio this month
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Total Liquid Bank Balance</span>
          <p className="text-2xl font-bold text-white font-mono-numbers mt-1">
            {formatAmount(kpis.totalAvailableBalance)}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            Available across {accounts.length} checking & savings accounts
          </p>
        </div>
      </div>

      {/* 3. Goals Progress Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Active Savings Goals ({goals.length})</h3>
          <span className="text-xs text-slate-400">Double-entry asset allocation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const progress = goal.targetAmount > 0
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
              : 0;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{goal.name}</h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            goal.priority === 'HIGH'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {goal.priority || 'MEDIUM'}
                        </span>
                      </div>
                      {goal.notes && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{goal.notes}</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        deleteGoal(goal.id);
                        soundFx.playPop();
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Accumulated</span>
                      <span className="text-lg font-bold text-cyan-300 font-mono-numbers">
                        {formatAmount(goal.currentAmount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Target ({formatDate(goal.deadline)})</span>
                      <span className="text-sm font-semibold text-slate-300 font-mono-numbers">
                        {formatAmount(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{progress}% funded</span>
                    <span>Remaining: {formatAmount(remaining)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-end">
                  <button
                    onClick={() => {
                      setSelectedGoalId(goal.id);
                      setIsDepositModalOpen(true);
                      soundFx.playPop();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Contribute Funds</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contribute Funds Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-cyan-400" />
              <span>Contribute to Savings Goal</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Transfers funds from an existing account into this goal reservation without inflating income.
            </p>

            <form onSubmit={handleDepositSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Target Savings Goal</label>
                <select
                  value={selectedGoalId}
                  onChange={e => setSelectedGoalId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                >
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Source Account</label>
                <select
                  value={depositSourceAccountId}
                  onChange={e => setDepositSourceAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatAmount(a.balance)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Contribution Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono-numbers"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Confirm Contribution (₹)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Goal Modal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <span>Create New Financial Goal</span>
            </h3>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Goal Name *</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={e => setGoalName(e.target.value)}
                  placeholder="e.g. Higher Education Fund, Laptop Upgrade"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Target Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    value={goalTargetAmount}
                    onChange={e => setGoalTargetAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Initial Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={goalCurrentAmount}
                    onChange={e => setGoalCurrentAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={e => setGoalDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Priority</label>
                  <select
                    value={goalPriority}
                    onChange={e => setGoalPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Purpose / Notes</label>
                <textarea
                  rows={2}
                  value={goalNotes}
                  onChange={e => setGoalNotes(e.target.value)}
                  placeholder="Explain why this goal is important..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
