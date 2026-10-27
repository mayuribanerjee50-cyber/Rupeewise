import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ActiveTab } from './Navigation';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
  Plus,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  Trash2,
  Repeat,
  Target,
  PieChart as PieIcon,
  Activity,
  Layers,
  Edit2,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { soundFx } from '../services/sound';
import { EXPENSE_CATEGORIES } from '../data/categories';
import { EditTransactionModal } from './modals/EditTransactionModal';
import { Transaction } from '../types/finance';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddTx: () => void;
}

export const DashboardView: React.FC<Props> = ({ onNavigate, onOpenAddTx }) => {
  const {
    kpis,
    formatAmount,
    formatDate,
    transactions,
    accounts,
    budgets,
    goals,
    recurring,
    profile,
    insights,
    dismissInsight,
    deleteTransaction,
    confirmRecurringTransaction,
  } = useFinance();

  // Filters state (Section 6: Dashboard controls)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [dateRangeFilter, setDateRangeFilter] = useState<'current' | 'prev' | '6months' | 'all'>('current');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');

  // Dynamic Time-of-day Greeting (Section 6)
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const userName = profile.fullName ? profile.fullName.split(' ')[0] : '';

  // Filtered transactions for charts and list
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    return transactions.filter(t => {
      if (dateRangeFilter === 'current' && !t.date.startsWith(currentMonth)) return false;
      if (dateRangeFilter === 'prev' && !t.date.startsWith(prevMonth)) return false;
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
      if (selectedAccountId !== 'ALL' && t.accountId !== selectedAccountId && t.targetAccountId !== selectedAccountId) return false;
      return true;
    });
  }, [transactions, dateRangeFilter, selectedCategory, selectedAccountId]);

  // Chart A: Expense Breakdown Doughnut Chart
  const expenseChartData = useMemo(() => {
    const catMap: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });

    const labels = Object.keys(catMap);
    const data = Object.values(catMap);

    const colors = labels.map(label => {
      const found = EXPENSE_CATEGORIES.find(c => c.name === label);
      return found ? found.color : '#64748B';
    });

    return {
      labels,
      datasets: [
        {
          data: data.length > 0 ? data : [1],
          backgroundColor: data.length > 0 ? colors : ['#334155'],
          borderColor: '#0f172a',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [filteredTransactions]);

  // Chart B: Monthly Income vs Expenses (Last 6 Months Bar Chart)
  const monthlyComparisonData = useMemo(() => {
    const months: { label: string; key: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ label: d.toLocaleString('en-IN', { month: 'short' }), key });
    }

    const incomeData = months.map(m =>
      transactions
        .filter(t => t.date.startsWith(m.key) && t.type === 'income')
        .reduce((s, t) => s + t.amount, 0)
    );

    const expenseData = months.map(m =>
      transactions
        .filter(t => t.date.startsWith(m.key) && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0)
    );

    return {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Income (₹)',
          data: incomeData,
          backgroundColor: '#10B981',
          borderRadius: 6,
        },
        {
          label: 'Expenses (₹)',
          data: expenseData,
          backgroundColor: '#F43F5E',
          borderRadius: 6,
        },
      ],
    };
  }, [transactions]);

  // Chart C: Savings Trend Line Chart (Calculated from opening balance + history)
  const savingsTrendData = useMemo(() => {
    const months: { label: string; key: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ label: d.toLocaleString('en-IN', { month: 'short' }), key });
    }

    // Cumulative balance calculation
    let balance = accounts.reduce((s, a) => s + (a.openingBalance ?? 15000), 0);
    const trendValues: number[] = [];

    months.forEach(m => {
      const inMonth = transactions.filter(t => t.date.startsWith(m.key));
      const inc = inMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = inMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      balance += (inc - exp);
      trendValues.push(Math.max(0, balance));
    });

    return {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Savings Reserve (₹)',
          data: trendValues,
          fill: true,
          borderColor: '#06B6D4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          tension: 0.35,
          pointBackgroundColor: '#06B6D4',
        },
      ],
    };
  }, [accounts, transactions]);

  // Chart D: Budget Utilisation Bar Chart
  const budgetUtilisationData = useMemo(() => {
    const now = new Date();
    const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthExpenses = transactions.filter(t => t.date.startsWith(curMonth) && t.type === 'expense');

    const labels: string[] = [];
    const spentData: number[] = [];
    const budgetData: number[] = [];

    budgets.slice(0, 5).forEach(b => {
      labels.push(b.category);
      const spent = thisMonthExpenses
        .filter(t => t.category === b.category)
        .reduce((s, t) => s + t.amount, 0);
      spentData.push(spent);
      budgetData.push(b.monthlyLimit);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Actual Spent (₹)',
          data: spentData,
          backgroundColor: '#F59E0B',
          borderRadius: 4,
        },
        {
          label: 'Budget Limit (₹)',
          data: budgetData,
          backgroundColor: '#334155',
          borderRadius: 4,
        },
      ],
    };
  }, [budgets, transactions]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Personalized Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {greeting}!
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
              Asia, Jaipur
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Here is your live financial overview in Indian Rupees (₹).
          </p>
        </div>

        {/* Dashboard Controls (Section 6) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date range filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => { setDateRangeFilter('current'); soundFx.playPop(); }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                dateRangeFilter === 'current' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => { setDateRangeFilter('prev'); soundFx.playPop(); }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                dateRangeFilter === 'prev' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => { setDateRangeFilter('6months'); soundFx.playPop(); }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                dateRangeFilter === '6months' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              6 Months
            </button>
          </div>

          <button
            onClick={onOpenAddTx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-sm shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record (₹)</span>
          </button>
        </div>
      </div>

      {/* 2. Intelligent Financial Insights (Section 16) */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map(ins => (
            <div
              key={ins.id}
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                ins.type === 'warning'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : ins.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold">{ins.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{ins.message}</p>
                </div>
              </div>
              <button
                onClick={() => dismissInsight(ins.id)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. Eight Summary Cards with MoM Indicators (Section 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Available Balance */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Available Balance</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white font-mono-numbers">
            {formatAmount(kpis.totalAvailableBalance)}
          </div>
          <div className="mt-1 flex items-center text-[10px] text-emerald-400">
            <span>Across {accounts.length} active accounts</span>
          </div>
        </div>

        {/* Card 2: Total Savings */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Savings</span>
            <PiggyBank className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-cyan-400 font-mono-numbers">
            {formatAmount(kpis.totalSavings)}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            <span>{goals.length} target goals tracked</span>
          </div>
        </div>

        {/* Card 3: Current Month's Income */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>This Month's Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-400 font-mono-numbers">
            {formatAmount(kpis.currentMonthIncome)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400">
            <span>+{kpis.incomeChangePct}% vs prev month</span>
          </div>
        </div>

        {/* Card 4: Current Month's Expenses */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>This Month's Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-rose-400 font-mono-numbers">
            {formatAmount(kpis.currentMonthExpenses)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
            <span>Avg ₹{kpis.averageDailyExpense}/day</span>
          </div>
        </div>

        {/* Card 5: Net Cash Flow */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Net Cash Flow</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div
            className={`mt-2 text-xl font-bold font-mono-numbers ${
              kpis.currentMonthNetCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {kpis.currentMonthNetCashFlow >= 0 ? '+' : ''}
            {formatAmount(kpis.currentMonthNetCashFlow)}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            <span>Income − Expenses</span>
          </div>
        </div>

        {/* Card 6: Remaining Monthly Budget */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Remaining Budget</span>
            <PieIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-400 font-mono-numbers">
            {formatAmount(kpis.remainingMonthlyBudget)}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            <span>For remaining days in month</span>
          </div>
        </div>

        {/* Card 7: Savings Rate */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Savings Rate</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-indigo-400 font-mono-numbers">
            {kpis.savingsRate}%
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            <span>Target: ≥ 20% (50/30/20)</span>
          </div>
        </div>

        {/* Card 8: Outstanding Planned Payments */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Outstanding Scheduled</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-purple-400 font-mono-numbers">
            {formatAmount(kpis.outstandingPlannedPayments)}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            <span>Upcoming recurring dues</span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Charts Section (Chart.js as specified in PDF Section 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart A: Expense Breakdown Doughnut */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div>
              <h3 className="text-sm font-semibold text-white">Expense Breakdown by Category</h3>
              <p className="text-[11px] text-slate-400">Interactive doughnut with tooltip details</p>
            </div>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 min-h-[240px] flex items-center justify-center p-2">
            <div className="w-full max-w-[280px] h-[220px]">
              <Doughnut
                data={expenseChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 10 },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Chart B: Monthly Income vs Expenses Bar Chart */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div>
              <h3 className="text-sm font-semibold text-white">Income vs Expenses (6 Months)</h3>
              <p className="text-[11px] text-slate-400">Historical performance with separate bars</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Reports</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 min-h-[240px] p-2">
            <Bar
              data={monthlyComparisonData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#1e293b' } },
                  y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#1e293b' } },
                },
                plugins: {
                  legend: { labels: { color: '#94a3b8', font: { size: 10 } } },
                },
              }}
            />
          </div>
        </div>

        {/* Chart C: Savings Trend Line Chart */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div>
              <h3 className="text-sm font-semibold text-white">Savings Reserve Trend</h3>
              <p className="text-[11px] text-slate-400">Calculated from opening balance + recorded transactions</p>
            </div>
            <button
              onClick={() => onNavigate('savings')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Goals</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 min-h-[220px] p-2">
            <Line
              data={savingsTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#1e293b' } },
                  y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#1e293b' } },
                },
                plugins: {
                  legend: { labels: { color: '#94a3b8', font: { size: 10 } } },
                },
              }}
            />
          </div>
        </div>

        {/* Chart D: Budget Utilisation Comparison */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div>
              <h3 className="text-sm font-semibold text-white">Budget Utilisation (Top Categories)</h3>
              <p className="text-[11px] text-slate-400">Comparing actual spending vs monthly limits</p>
            </div>
            <button
              onClick={() => onNavigate('budgets')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Budgets</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 min-h-[220px] p-2">
            <Bar
              data={budgetUtilisationData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#1e293b' } },
                  y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#1e293b' } },
                },
                plugins: {
                  legend: { labels: { color: '#94a3b8', font: { size: 10 } } },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* 5. Bottom Two-Column: Recent Stored Transactions & Upcoming Recurring Commitments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions Stream (2 cols) */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
              <p className="text-[11px] text-slate-400">Persisted entries with one-click deletion</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-800/50">
            {transactions.slice(0, 5).map(tx => {
              const acc = accounts.find(a => a.id === tx.accountId);
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              return (
                <div key={tx.id} className="py-2.5 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isIncome
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : isTransfer
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '⇄' : '−'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{tx.payee}</p>
                      <p className="text-[10px] text-slate-400">
                        {formatDate(tx.date)} • {tx.category} • {acc?.name || 'Account'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold font-mono-numbers ${
                        isIncome ? 'text-emerald-400' : isTransfer ? 'text-blue-400' : 'text-slate-200'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '' : '−'}
                      {formatAmount(tx.amount)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingTx(tx);
                          soundFx.playPop();
                        }}
                        className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          deleteTransaction(tx.id);
                          soundFx.playPop();
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Scheduled Dues (1 col) */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div>
              <h3 className="text-sm font-semibold text-white">Upcoming Commitments</h3>
              <p className="text-[11px] text-slate-400">Recurring payments due this month</p>
            </div>
            <button
              onClick={() => onNavigate('recurring')}
              className="text-xs text-purple-400 hover:underline"
            >
              Schedules
            </button>
          </div>

          <div className="mt-3 space-y-2.5 flex-1">
            {recurring.slice(0, 4).map(rec => (
              <div
                key={rec.id}
                className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-200">{rec.name}</p>
                  <p className="text-[10px] text-slate-400">Due day {rec.dueDay} of month</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-numbers font-semibold text-purple-300">
                    {formatAmount(rec.amount)}
                  </span>
                  <button
                    onClick={() => {
                      confirmRecurringTransaction(rec.id);
                      soundFx.playCoin();
                    }}
                    className="p-1 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                    title="Confirm payment"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('specs')}
            className="mt-4 w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Specs & Teacher Demo</span>
          </button>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        transaction={editingTx}
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
      />
    </div>
  );
};
