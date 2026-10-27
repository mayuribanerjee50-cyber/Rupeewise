import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Account,
  Transaction,
  Budget,
  SavingsGoal,
  RecurringItem,
  UserProfile,
  FinancialInsight,
  CurrencyCode,
} from '../types/finance';
import {
  getStoredAccounts,
  saveStoredAccounts,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredBudgets,
  saveStoredBudgets,
  getStoredGoals,
  saveStoredGoals,
  getStoredRecurring,
  saveStoredRecurring,
  getStoredProfile,
  saveStoredProfile,
  resetAllToDemo,
  clearAllData as storageClearAll,
  formatCurrency,
  formatDateIndian,
  isFirstLaunchSetupCompleted,
  markFirstLaunchSetupCompleted,
} from '../services/storage';
import {
  DEMO_ACCOUNTS,
  DEMO_BUDGETS,
  DEMO_GOALS,
  DEMO_RECURRING,
  DEMO_TRANSACTIONS,
  DEMO_USER_PROFILE,
} from '../data/mockData';

interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  recurring: RecurringItem[];
  profile: UserProfile;
  currency: CurrencyCode;
  formatAmount: (amount: number) => string;
  formatDate: (dateStr: string) => string;
  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  duplicateTransaction: (id: string) => void;
  // Accounts
  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;
  transferFunds: (fromId: string, toId: string, amount: number, note?: string) => void;
  // Budgets
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;
  // Goals
  addGoal: (g: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (g: SavingsGoal) => void;
  depositToGoal: (goalId: string, amount: number, fromAccountId?: string) => void;
  deleteGoal: (id: string) => void;
  // Recurring
  addRecurring: (r: Omit<RecurringItem, 'id'>) => void;
  updateRecurring: (r: RecurringItem) => void;
  deleteRecurring: (id: string) => void;
  confirmRecurringTransaction: (id: string) => void;
  // Profile & Setup
  updateProfile: (p: Partial<UserProfile>) => void;
  isFirstSetupOpen: boolean;
  setIsFirstSetupOpen: (open: boolean) => void;
  completeFirstSetup: (profileData: UserProfile) => void;
  // Demo Controls
  loadDemoData: () => void;
  clearDemoData: () => void;
  resetDemoData: () => void;
  // Insights
  insights: FinancialInsight[];
  dismissInsight: (id: string) => void;
  // KPIs
  kpis: {
    totalAvailableBalance: number;
    totalSavings: number;
    currentMonthIncome: number;
    currentMonthExpenses: number;
    currentMonthNetCashFlow: number;
    remainingMonthlyBudget: number;
    savingsRate: number;
    outstandingPlannedPayments: number;
    incomeChangePct: number;
    expenseChangePct: number;
    highestExpenseCategory: string;
    averageDailyExpense: number;
    fixedExpenseTotal: number;
    variableExpenseTotal: number;
    essentialTotal: number;
    discretionaryTotal: number;
  };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(getStoredAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(getStoredBudgets);
  const [goals, setGoals] = useState<SavingsGoal[]>(getStoredGoals);
  const [recurring, setRecurring] = useState<RecurringItem[]>(getStoredRecurring);
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile);
  const [dismissedInsightIds, setDismissedInsightIds] = useState<string[]>([]);
  const [isFirstSetupOpen, setIsFirstSetupOpen] = useState<boolean>(!isFirstLaunchSetupCompleted());

  // Storage Persistence Sync
  useEffect(() => { saveStoredAccounts(accounts); }, [accounts]);
  useEffect(() => { saveStoredTransactions(transactions); }, [transactions]);
  useEffect(() => { saveStoredBudgets(budgets); }, [budgets]);
  useEffect(() => { saveStoredGoals(goals); }, [goals]);
  useEffect(() => { saveStoredRecurring(recurring); }, [recurring]);
  useEffect(() => { saveStoredProfile(profile); }, [profile]);

  const formatAmount = useCallback((amount: number) => {
    return formatCurrency(amount, 'INR');
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    return formatDateIndian(dateStr);
  }, []);

  // 1. Transaction Operations
  const addTransaction = (data: Omit<Transaction, 'id'>) => {
    const id = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newTx: Transaction = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);

    // Polymorphic Balance Update
    setAccounts(prevAccounts =>
      prevAccounts.map(acc => {
        if (data.type === 'expense' && acc.id === data.accountId) {
          return { ...acc, balance: acc.balance - data.amount };
        }
        if (data.type === 'income' && acc.id === data.accountId) {
          return { ...acc, balance: acc.balance + data.amount };
        }
        if (data.type === 'transfer') {
          if (acc.id === data.accountId) return { ...acc, balance: acc.balance - data.amount };
          if (acc.id === data.targetAccountId) return { ...acc, balance: acc.balance + data.amount };
        }
        return acc;
      })
    );

    // Call REST endpoint
    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newTx,
        transactionDate: newTx.date,
        transactionType: newTx.type.toUpperCase(),
        description: newTx.payee,
        paymentMethod: newTx.paymentMethod || 'UPI',
      }),
    }).catch(() => {});
  };

  const updateTransaction = (updatedTx: Transaction) => {
    const existing = transactions.find(t => t.id === updatedTx.id);
    if (!existing) return;

    // Reverse old balance
    setAccounts(prev =>
      prev.map(acc => {
        let bal = acc.balance;
        if (existing.type === 'expense' && acc.id === existing.accountId) bal += existing.amount;
        if (existing.type === 'income' && acc.id === existing.accountId) bal -= existing.amount;
        if (existing.type === 'transfer') {
          if (acc.id === existing.accountId) bal += existing.amount;
          if (acc.id === existing.targetAccountId) bal -= existing.amount;
        }

        // Apply new balance
        if (updatedTx.type === 'expense' && acc.id === updatedTx.accountId) bal -= updatedTx.amount;
        if (updatedTx.type === 'income' && acc.id === updatedTx.accountId) bal += updatedTx.amount;
        if (updatedTx.type === 'transfer') {
          if (acc.id === updatedTx.accountId) bal -= updatedTx.amount;
          if (acc.id === updatedTx.targetAccountId) bal += updatedTx.amount;
        }
        return { ...acc, balance: bal };
      })
    );

    setTransactions(prev =>
      prev.map(t => (t.id === updatedTx.id ? { ...updatedTx, updatedAt: new Date().toISOString() } : t))
    );

    fetch(`/api/transactions/${updatedTx.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...updatedTx,
        transactionDate: updatedTx.date,
        transactionType: updatedTx.type.toUpperCase(),
        description: updatedTx.payee,
      }),
    }).catch(() => {});
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      setAccounts(prev =>
        prev.map(acc => {
          if (tx.type === 'expense' && acc.id === tx.accountId) {
            return { ...acc, balance: acc.balance + tx.amount };
          }
          if (tx.type === 'income' && acc.id === tx.accountId) {
            return { ...acc, balance: acc.balance - tx.amount };
          }
          if (tx.type === 'transfer') {
            if (acc.id === tx.accountId) return { ...acc, balance: acc.balance + tx.amount };
            if (acc.id === tx.targetAccountId) return { ...acc, balance: acc.balance - tx.amount };
          }
          return acc;
        })
      );
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
    fetch(`/api/transactions/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const duplicateTransaction = (id: string) => {
    const original = transactions.find(t => t.id === id);
    if (!original) return;
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: original.amount,
      type: original.type,
      category: original.category,
      accountId: original.accountId,
      targetAccountId: original.targetAccountId,
      payee: `${original.payee} (Copy)`,
      paymentMethod: original.paymentMethod,
      note: original.note,
      cleared: original.cleared,
    });
  };

  // 2. Account Operations
  const addAccount = (data: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...data,
      id: `acc-${Date.now()}`,
      openingBalance: data.openingBalance ?? data.balance,
    };
    setAccounts(prev => [...prev, newAcc]);
    fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAcc),
    }).catch(() => {});
  };

  const updateAccount = (acc: Account) => {
    setAccounts(prev => prev.map(a => (a.id === acc.id ? acc : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const transferFunds = (fromId: string, toId: string, amount: number, note?: string) => {
    const fromAcc = accounts.find(a => a.id === fromId);
    const toAcc = accounts.find(a => a.id === toId);
    if (!fromAcc || !toAcc || amount <= 0) return;

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      amount,
      type: 'transfer',
      category: 'Transfer',
      accountId: fromId,
      targetAccountId: toId,
      payee: `Transfer to ${toAcc.name}`,
      paymentMethod: 'Internal Transfer',
      note: note || `Inter-account transfer from ${fromAcc.name} to ${toAcc.name}`,
      cleared: true,
    });
  };

  // 3. Budget Operations
  const addBudget = (data: Omit<Budget, 'id'>) => {
    const newBudget: Budget = { ...data, id: `b-${Date.now()}` };
    setBudgets(prev => [...prev, newBudget]);
  };

  const updateBudget = (b: Budget) => {
    setBudgets(prev => prev.map(item => (item.id === b.id ? b : item)));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // 4. Goals Operations
  const addGoal = (data: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = { ...data, id: `g-${Date.now()}` };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (g: SavingsGoal) => {
    setGoals(prev => prev.map(item => (item.id === g.id ? g : item)));
  };

  const depositToGoal = (goalId: string, amount: number, fromAccountId?: string) => {
    if (amount <= 0) return;
    setGoals(prev =>
      prev.map(g => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );
    if (fromAccountId) {
      setAccounts(prev =>
        prev.map(a => (a.id === fromAccountId ? { ...a, balance: Math.max(0, a.balance - amount) } : a))
      );
    }
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // 5. Recurring Operations
  const addRecurring = (data: Omit<RecurringItem, 'id'>) => {
    const newItem: RecurringItem = { ...data, id: `rec-${Date.now()}`, active: true };
    setRecurring(prev => [...prev, newItem]);
  };

  const updateRecurring = (r: RecurringItem) => {
    setRecurring(prev => prev.map(item => (item.id === r.id ? r : item)));
  };

  const deleteRecurring = (id: string) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
  };

  const confirmRecurringTransaction = (id: string) => {
    const item = recurring.find(r => r.id === id);
    if (!item) return;

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: item.amount,
      type: item.type || 'expense',
      category: item.category,
      accountId: item.accountId,
      payee: item.name,
      paymentMethod: item.autoPay ? 'Auto-Debit' : 'Manual Payment',
      note: `Recurring schedule confirmation`,
      cleared: true,
    });

    setRecurring(prev =>
      prev.map(r => (r.id === id ? { ...r, paidThisMonth: true, lastPaidDate: new Date().toISOString().split('T')[0] } : r))
    );
  };

  // 6. Profile & Setup
  const updateProfile = (patch: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...patch }));
  };

  const completeFirstSetup = (profileData: UserProfile) => {
    setProfile(profileData);
    markFirstLaunchSetupCompleted();
    setIsFirstSetupOpen(false);
  };

  // 7. Demo Data Management (Section 18 of prompt)
  const loadDemoData = () => {
    setAccounts(DEMO_ACCOUNTS);
    setTransactions(DEMO_TRANSACTIONS);
    setBudgets(DEMO_BUDGETS);
    setGoals(DEMO_GOALS);
    setRecurring(DEMO_RECURRING);
    setProfile(DEMO_USER_PROFILE);
    resetAllToDemo();
  };

  const clearDemoData = () => {
    setAccounts([]);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setRecurring([]);
    storageClearAll();
  };

  const resetDemoData = () => {
    loadDemoData();
  };

  // 8. Financial Calculations & KPIs
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const kpis = useMemo(() => {
    const totalAvailableBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
    const totalSavings = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);

    const thisMonthTxs = transactions.filter(t => t.date.startsWith(currentMonthPrefix));
    const prevMonthTxs = transactions.filter(t => t.date.startsWith(prevMonthPrefix));

    const currentMonthIncome = thisMonthTxs
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const currentMonthExpenses = thisMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const prevMonthIncome = prevMonthTxs
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const prevMonthExpenses = prevMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const currentMonthNetCashFlow = currentMonthIncome - currentMonthExpenses;

    const totalBudget = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
    const remainingMonthlyBudget = Math.max(0, totalBudget - currentMonthExpenses);

    // Savings Rate = (Income - Expense) / Income * 100 with zero-division safety
    const savingsRate = currentMonthIncome > 0
      ? Math.max(0, ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100)
      : 0;

    const outstandingPlannedPayments = recurring
      .filter(r => r.active !== false && !r.paidThisMonth && r.type !== 'income')
      .reduce((s, r) => s + r.amount, 0);

    const incomeChangePct = prevMonthIncome > 0
      ? ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100
      : 0;

    const expenseChangePct = prevMonthExpenses > 0
      ? ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
      : 0;

    // Highest expense category
    const catMap: Record<string, number> = {};
    thisMonthTxs
      .filter(t => t.type === 'expense')
      .forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
    const highestExpenseCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    const dayOfMonth = now.getDate() || 1;
    const averageDailyExpense = currentMonthExpenses / dayOfMonth;

    // Fixed vs Variable (Housing, Utilities, Subscriptions = Fixed; Food, Shopping, Entertainment = Variable)
    const fixedCategories = ['Housing and utilities', 'Subscriptions', 'Education'];
    let fixedExpenseTotal = 0;
    let variableExpenseTotal = 0;
    thisMonthTxs.filter(t => t.type === 'expense').forEach(t => {
      if (fixedCategories.includes(t.category)) fixedExpenseTotal += t.amount;
      else variableExpenseTotal += t.amount;
    });

    // Essential vs Discretionary
    const essentialCategories = ['Food and groceries', 'Transportation', 'Housing and utilities', 'Healthcare', 'Education'];
    let essentialTotal = 0;
    let discretionaryTotal = 0;
    thisMonthTxs.filter(t => t.type === 'expense').forEach(t => {
      if (essentialCategories.includes(t.category)) essentialTotal += t.amount;
      else discretionaryTotal += t.amount;
    });

    return {
      totalAvailableBalance,
      totalSavings,
      currentMonthIncome,
      currentMonthExpenses,
      currentMonthNetCashFlow,
      remainingMonthlyBudget,
      savingsRate: Number(savingsRate.toFixed(1)),
      outstandingPlannedPayments,
      incomeChangePct: Number(incomeChangePct.toFixed(1)),
      expenseChangePct: Number(expenseChangePct.toFixed(1)),
      highestExpenseCategory,
      averageDailyExpense: Math.round(averageDailyExpense),
      fixedExpenseTotal,
      variableExpenseTotal,
      essentialTotal,
      discretionaryTotal,
    };
  }, [accounts, goals, transactions, budgets, recurring, currentMonthPrefix, prevMonthPrefix, now]);

  // 9. Rule-Based Intelligent Financial Insights Engine (Section 16 of prompt)
  const insights: FinancialInsight[] = useMemo(() => {
    const list: FinancialInsight[] = [];

    // Rule 1: Monthly Budget Exceeded or Warning
    const totalBudget = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
    if (totalBudget > 0 && kpis.currentMonthExpenses > totalBudget) {
      list.push({
        id: 'ins-budget-exceeded',
        title: 'Monthly Budget Limit Exceeded',
        message: `Your total spending of ${formatCurrency(kpis.currentMonthExpenses)} exceeds your combined monthly budget of ${formatCurrency(totalBudget)} by ${formatCurrency(kpis.currentMonthExpenses - totalBudget)}.`,
        type: 'warning',
      });
    } else if (totalBudget > 0 && kpis.currentMonthExpenses / totalBudget >= 0.85) {
      list.push({
        id: 'ins-budget-near',
        title: 'Approaching Budget Ceiling',
        message: `You have consumed ${Math.round((kpis.currentMonthExpenses / totalBudget) * 100)}% of your monthly budget allocation for ${now.toLocaleString('default', { month: 'long' })}.`,
        type: 'info',
      });
    }

    // Rule 2: Positive Savings Rate Recognition
    if (kpis.savingsRate >= 20) {
      list.push({
        id: 'ins-savings-rate-good',
        title: 'Healthy Savings Rate Achieved',
        message: `Outstanding! Your current savings rate is ${kpis.savingsRate}%, adhering strictly to the recommended 50/30/20 personal wealth model.`,
        type: 'success',
      });
    }

    // Rule 3: Category spending increase compared to previous month
    if (kpis.highestExpenseCategory !== 'None') {
      list.push({
        id: 'ins-highest-cat',
        title: `Primary Expenditure Driver: ${kpis.highestExpenseCategory}`,
        message: `${kpis.highestExpenseCategory} represents your single largest spending category this month.`,
        type: 'info',
        category: kpis.highestExpenseCategory,
      });
    }

    // Rule 4: Upcoming Recurring Commitment Alert
    if (kpis.outstandingPlannedPayments > 0) {
      list.push({
        id: 'ins-recurring-due',
        title: 'Upcoming Scheduled Payments',
        message: `You have ${formatCurrency(kpis.outstandingPlannedPayments)} in pending monthly bills and subscriptions scheduled for payment this month.`,
        type: 'info',
      });
    }

    return list.filter(i => !dismissedInsightIds.includes(i.id));
  }, [budgets, kpis, dismissedInsightIds, now]);

  const dismissInsight = (id: string) => {
    setDismissedInsightIds(prev => [...prev, id]);
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        budgets,
        goals,
        recurring,
        profile,
        currency: 'INR',
        formatAmount,
        formatDate,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        duplicateTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        transferFunds,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        depositToGoal,
        deleteGoal,
        addRecurring,
        updateRecurring,
        deleteRecurring,
        confirmRecurringTransaction,
        updateProfile,
        isFirstSetupOpen,
        setIsFirstSetupOpen,
        completeFirstSetup,
        loadDemoData,
        clearDemoData,
        resetDemoData,
        insights,
        dismissInsight,
        kpis,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
