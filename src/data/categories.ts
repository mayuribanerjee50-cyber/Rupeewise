/**
 * RupeeWise Categories & Payment Methods
 * Matches Section 6.A and Section 9 of the RupeeWise Master Development Prompt.
 */

export const EXPENSE_CATEGORIES = [
  { name: 'Food and groceries', color: '#10B981' },
  { name: 'Education', color: '#8B5CF6' },
  { name: 'Transportation', color: '#3B82F6' },
  { name: 'Housing and utilities', color: '#EC4899' },
  { name: 'Healthcare', color: '#EF4444' },
  { name: 'Shopping', color: '#F97316' },
  { name: 'Entertainment', color: '#F59E0B' },
  { name: 'Personal care', color: '#14B8A6' },
  { name: 'Subscriptions', color: '#6366F1' },
  { name: 'Miscellaneous', color: '#64748B' },
];

export const INCOME_CATEGORIES = [
  { name: 'Tuition Income', color: '#10B981' },
  { name: 'Tutoring Income', color: '#3B82F6' },
  { name: 'Salary', color: '#059669' },
  { name: 'Freelancing', color: '#8B5CF6' },
  { name: 'Scholarships', color: '#F59E0B' },
  { name: 'Business Income', color: '#6366F1' },
  { name: 'Interest & Investments', color: '#14B8A6' },
  { name: 'Gifts & Grants', color: '#EC4899' },
  { name: 'Occasional Extra Income', color: '#F97316' },
  { name: 'Other Income', color: '#64748B' },
];

export const PAYMENT_METHODS = [
  'UPI (GPay / PhonePe / Paytm)',
  'Net Banking',
  'Debit Card',
  'Credit Card',
  'Cash',
  'Cheque / Demand Draft',
];

export const BUDGETING_METHODS = [
  '50/30/20 Rule (50% Needs, 30% Wants, 20% Savings)',
  'Zero-Based Budgeting (Every Rupee has a job)',
  'Envelope System (Strict cash/category allocations)',
  'Pay Yourself First (Reverse Budgeting)',
  'Custom Academic Plan',
];

export const CURRENCIES: Record<string, { code: string; symbol: string; name: string; rate: number }> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', rate: 1.0 },
};
