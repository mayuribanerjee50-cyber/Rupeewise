export type TransactionType = 'expense' | 'income' | 'transfer';

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  openingBalance?: number;
  currency: string;
  institution: string;
  accountNumberMask?: string;
  color: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // positive number in INR
  type: TransactionType;
  category: string;
  accountId: string;
  targetAccountId?: string; // for transfer
  payee: string; // description / payee
  paymentMethod?: string;
  note?: string;
  tags?: string;
  cleared: boolean;
  recurringId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  color: string;
  carryForward?: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  color: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
  accountId?: string;
}

export interface RecurringItem {
  id: string;
  name: string;
  amount: number;
  type?: 'expense' | 'income';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dueDay: number; // day of month (1-31)
  category: string;
  accountId: string;
  autoPay: boolean;
  active?: boolean;
  paidThisMonth?: boolean;
  lastPaidDate?: string;
}

export interface UserProfile {
  fullName: string;
  email?: string;
  monthlyIncomeTarget: number;
  initialSavingsBalance: number;
  monthlySavingsGoal: number;
  budgetingMethod: string;
  financialYearStart: string;
  monthlyExpenseBudget: number;
  shortTermGoal?: string;
  longTermGoal?: string;
}

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
  type: 'credit_card' | 'student_loan' | 'auto_loan' | 'mortgage' | 'personal';
}

export type CurrencyCode = 'INR';

export interface FinancialInsight {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'info';
  category?: string;
  period?: string;
  dismissed?: boolean;
}
