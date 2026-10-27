import {
  Account,
  Transaction,
  Budget,
  SavingsGoal,
  RecurringItem,
  UserProfile,
  CurrencyCode,
} from '../types/finance';
import {
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_RECURRING,
  INITIAL_TRANSACTIONS,
  DEMO_ACCOUNTS,
  DEMO_BUDGETS,
  DEMO_GOALS,
  DEMO_RECURRING,
  DEMO_TRANSACTIONS,
  DEMO_USER_PROFILE,
} from '../data/mockData';

const STORAGE_KEYS = {
  ACCOUNTS: 'rupeewise_accounts_v1',
  TRANSACTIONS: 'rupeewise_transactions_v1',
  BUDGETS: 'rupeewise_budgets_v1',
  GOALS: 'rupeewise_goals_v1',
  RECURRING: 'rupeewise_recurring_v1',
  PROFILE: 'rupeewise_user_profile_v1',
  SETUP_DONE: 'rupeewise_setup_completed_v1',
};

// Memory fallback to ensure zero crashes in strict Chrome/iframe environments
const memStore: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // safe fallback
    }
    return memStore[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // safe fallback
    }
    memStore[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // safe fallback
    }
    delete memStore[key];
  },
};

export const getStoredProfile = (): UserProfile => {
  const item = safeStorage.getItem(STORAGE_KEYS.PROFILE);
  if (!item) {
    safeStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEMO_USER_PROFILE));
    return DEMO_USER_PROFILE;
  }
  try {
    const parsed = JSON.parse(item);
    if (parsed.fullName && /mayuri|banerjee/i.test(parsed.fullName)) {
      parsed.fullName = '';
      safeStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed));
    }
    return {
      ...DEMO_USER_PROFILE,
      ...parsed,
      fullName: /mayuri|banerjee/i.test(parsed.fullName || '') ? '' : (parsed.fullName || ''),
    };
  } catch {
    return DEMO_USER_PROFILE;
  }
};

export const saveStoredProfile = (profile: UserProfile) => {
  safeStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const getStoredAccounts = (): Account[] => {
  const item = safeStorage.getItem(STORAGE_KEYS.ACCOUNTS);
  if (!item) {
    safeStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
    return INITIAL_ACCOUNTS;
  }
  try {
    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_ACCOUNTS;
    }
    return parsed;
  } catch {
    return INITIAL_ACCOUNTS;
  }
};

export const saveStoredAccounts = (accounts: Account[]) => {
  safeStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
};

export const getStoredTransactions = (): Transaction[] => {
  const item = safeStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (!item) {
    safeStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }
  try {
    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_TRANSACTIONS;
    }
    return parsed;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
};

export const saveStoredTransactions = (transactions: Transaction[]) => {
  safeStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const getStoredBudgets = (): Budget[] => {
  const item = safeStorage.getItem(STORAGE_KEYS.BUDGETS);
  if (!item) {
    safeStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
    return INITIAL_BUDGETS;
  }
  try {
    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_BUDGETS;
    }
    return parsed;
  } catch {
    return INITIAL_BUDGETS;
  }
};

export const saveStoredBudgets = (budgets: Budget[]) => {
  safeStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
};

export const getStoredGoals = (): SavingsGoal[] => {
  const item = safeStorage.getItem(STORAGE_KEYS.GOALS);
  if (!item) {
    safeStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
    return INITIAL_GOALS;
  }
  try {
    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_GOALS;
    }
    return parsed;
  } catch {
    return INITIAL_GOALS;
  }
};

export const saveStoredGoals = (goals: SavingsGoal[]) => {
  safeStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
};

export const getStoredRecurring = (): RecurringItem[] => {
  const item = safeStorage.getItem(STORAGE_KEYS.RECURRING);
  if (!item) {
    safeStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(INITIAL_RECURRING));
    return INITIAL_RECURRING;
  }
  try {
    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_RECURRING;
    }
    return parsed;
  } catch {
    return INITIAL_RECURRING;
  }
};

export const saveStoredRecurring = (items: RecurringItem[]) => {
  safeStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(items));
};

export const getStoredCurrency = (): CurrencyCode => {
  return 'INR';
};

export const saveStoredCurrency = (_code: CurrencyCode) => {};

export const isFirstLaunchSetupCompleted = (): boolean => {
  return safeStorage.getItem(STORAGE_KEYS.SETUP_DONE) === 'true';
};

export const markFirstLaunchSetupCompleted = () => {
  safeStorage.setItem(STORAGE_KEYS.SETUP_DONE, 'true');
};

export const resetAllToDemo = () => {
  safeStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEMO_ACCOUNTS));
  safeStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEMO_TRANSACTIONS));
  safeStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEMO_BUDGETS));
  safeStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEMO_GOALS));
  safeStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(DEMO_RECURRING));
  safeStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEMO_USER_PROFILE));
  safeStorage.setItem(STORAGE_KEYS.SETUP_DONE, 'true');
};

export const clearAllData = () => {
  safeStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
  safeStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
  safeStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
  safeStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
  safeStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify([]));
};

/**
 * Format currency according to Indian numbering convention: ₹1,25,000.00
 * Complies with Section 3 of prompt.
 */
export const formatCurrency = (amount: number, _currencyCode: CurrencyCode = 'INR'): string => {
  const val = isNaN(amount) ? 0 : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

/**
 * Format date display as DD-MM-YYYY according to Section 3 of prompt.
 */
export const formatDateIndian = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      // YYYY-MM-DD -> DD-MM-YYYY
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch {
    // fallback
  }
  return dateString;
};

export const exportTransactionsToCSV = (transactions: Transaction[], accounts: Account[]): string => {
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));
  const headers = ['Transaction ID', 'Date (DD-MM-YYYY)', 'Type', 'Category', 'Account', 'Description / Payee', 'Amount (INR)', 'Payment Method', 'Notes'];

  const rows = transactions.map(t => [
    `"${t.id}"`,
    `"${formatDateIndian(t.date)}"`,
    `"${t.type.toUpperCase()}"`,
    `"${t.category}"`,
    `"${accountMap.get(t.accountId) || t.accountId}"`,
    `"${(t.payee || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    `"${t.paymentMethod || 'UPI'}"`,
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};
