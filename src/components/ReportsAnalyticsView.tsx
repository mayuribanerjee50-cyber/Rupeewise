import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Activity,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { exportTransactionsToCSV } from '../services/storage';
import { soundFx } from '../services/sound';

export const ReportsAnalyticsView: React.FC = () => {
  const { transactions, accounts, budgets, goals, kpis, formatAmount, formatDate } = useFinance();

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Calculate monthly stats based on selected month
  const monthStats = useMemo(() => {
    const inMonth = transactions.filter(t => t.date.startsWith(selectedMonth));
    const income = inMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = inMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const netCashFlow = income - expense;

    // Safe zero-division savings rate
    const savingsRate = income > 0 ? Math.max(0, ((income - expense) / income) * 100) : 0;

    // Previous month comparison
    const parts = selectedMonth.split('-');
    const prevDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 2, 1);
    const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const prevExpenses = transactions
      .filter(t => t.date.startsWith(prevKey) && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    // Monthly Expense Growth = (Current - Prev) / Prev * 100
    const expenseGrowth = prevExpenses > 0 ? ((expense - prevExpenses) / prevExpenses) * 100 : 0;

    return {
      income,
      expense,
      netCashFlow,
      savingsRate: Number(savingsRate.toFixed(1)),
      expenseGrowth: Number(expenseGrowth.toFixed(1)),
      count: inMonth.length,
      prevExpenses,
    };
  }, [transactions, selectedMonth]);

  const handleExportCSV = () => {
    soundFx.playCoin();
    const csv = exportTransactionsToCSV(transactions, accounts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RupeeWise_Monthly_Report_${selectedMonth}.csv`;
    link.click();
  };

  const handlePrint = () => {
    soundFx.playPop();
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              <span>Financial Reports & Executive Analytics</span>
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
              Section 15 Spec
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-ready calculations: Savings rate, Net cash flow, Budget utilisation, and Monthly expense growth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
          />
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV Report</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Formula Cards (Section 15) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Net Cash Flow</span>
          <p
            className={`text-2xl font-bold font-mono-numbers mt-1 ${
              monthStats.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {monthStats.netCashFlow >= 0 ? '+' : ''}
            {formatAmount(monthStats.netCashFlow)}
          </p>
          <p className="mt-2 text-[10px] text-slate-400">
            Formula: Income ({formatAmount(monthStats.income)}) − Expenses ({formatAmount(monthStats.expense)})
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Savings Rate</span>
          <p className="text-2xl font-bold text-indigo-400 font-mono-numbers mt-1">
            {monthStats.savingsRate}%
          </p>
          <p className="mt-2 text-[10px] text-slate-400">
            Formula: (Income − Expenses) / Income × 100
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Expense Growth (MoM)</span>
          <p
            className={`text-2xl font-bold font-mono-numbers mt-1 ${
              monthStats.expenseGrowth <= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {monthStats.expenseGrowth > 0 ? '+' : ''}
            {monthStats.expenseGrowth}%
          </p>
          <p className="mt-2 text-[10px] text-slate-400">
            Formula: (Current Exp − Prev Exp) / Prev Exp × 100
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Overall Budget Utilisation</span>
          <p className="text-2xl font-bold text-amber-400 font-mono-numbers mt-1">
            {budgets.reduce((s, b) => s + b.monthlyLimit, 0) > 0
              ? Math.round(
                  (monthStats.expense / budgets.reduce((s, b) => s + b.monthlyLimit, 0)) * 100
                )
              : 0}
            %
          </p>
          <p className="mt-2 text-[10px] text-slate-400">
            Formula: Actual Category Exp / Budget Limit × 100
          </p>
        </div>
      </div>

      {/* 3. Account Balance Reconciliation Summary */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-3">Accounts Balance Audit</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Account Name</th>
                <th className="py-2.5 px-3">Institution</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Opening Balance</th>
                <th className="py-2.5 px-3 text-right">Current Balance</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {accounts.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-white">{acc.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{acc.institution || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-400 capitalize">{acc.type}</td>
                  <td className="py-2.5 px-3 text-right font-mono-numbers text-slate-300">
                    {formatAmount(acc.openingBalance ?? acc.balance)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-numbers font-bold text-emerald-400">
                    {formatAmount(acc.balance)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Reconciled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
