import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  Copy,
  Edit2,
  CheckCircle2,
  Calendar,
  Wallet,
  Tag,
} from 'lucide-react';
import { soundFx } from '../services/sound';
import { Transaction, TransactionType } from '../types/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../data/categories';
import { exportTransactionsToCSV } from '../services/storage';
import { EditTransactionModal } from './modals/EditTransactionModal';

interface Props {
  onOpenAddTx: () => void;
}

export const TransactionsView: React.FC<Props> = ({ onOpenAddTx }) => {
  const {
    transactions,
    accounts,
    formatAmount,
    formatDate,
    deleteTransaction,
    duplicateTransaction,
    updateTransaction,
  } = useFinance();

  // Search & Filter State (Section 7)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterAccount, setFilterAccount] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered & Sorted Transactions
  const processedTransactions = useMemo(() => {
    let list = [...transactions];

    if (filterType !== 'ALL') {
      list = list.filter(t => t.type === filterType);
    }
    if (filterCategory !== 'ALL') {
      list = list.filter(t => t.category === filterCategory);
    }
    if (filterAccount !== 'ALL') {
      list = list.filter(t => t.accountId === filterAccount || t.targetAccountId === filterAccount);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        t =>
          t.payee.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'date') {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return sortOrder === 'desc' ? diff : -diff;
      } else {
        const diff = b.amount - a.amount;
        return sortOrder === 'desc' ? diff : -diff;
      }
    });

    return list;
  }, [transactions, filterType, filterCategory, filterAccount, searchQuery, sortBy, sortOrder]);

  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage) || 1;
  const paginatedList = processedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditClick = (tx: Transaction) => {
    setEditingTx(tx);
    soundFx.playPop();
  };

  const handleExportCSV = () => {
    soundFx.playCoin();
    const csv = exportTransactionsToCSV(transactions, accounts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RupeeWise_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Receipt className="w-6 h-6 text-emerald-400" />
              <span>Transaction Management</span>
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
              Section 7 Spec
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, search, filter, edit, duplicate, and delete income, expenses, and inter-account transfers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddTx}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction (₹)</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Multi-Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search description..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:border-emerald-500"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value); setCurrentPage(1); soundFx.playPop(); }}
          className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
        >
          <option value="ALL">All Types (Income, Expense, Transfer)</option>
          <option value="expense">Expenses Only</option>
          <option value="income">Income Only</option>
          <option value="transfer">Transfers Only</option>
        </select>

        {/* Account Filter */}
        <select
          value={filterAccount}
          onChange={e => { setFilterAccount(e.target.value); setCurrentPage(1); soundFx.playPop(); }}
          className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
        >
          <option value="ALL">All Accounts</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        {/* Sort By */}
        <div className="flex items-center gap-1">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Record count indicator */}
        <div className="flex items-center justify-end text-xs text-slate-400 font-medium pr-1">
          <span>{processedTransactions.length} records</span>
        </div>
      </div>

      {/* 3. Transactions Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-4">Payee / Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Account</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    No transactions match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedList.map(tx => {
                  const acc = accounts.find(a => a.id === tx.accountId);
                  const targetAcc = tx.targetAccountId ? accounts.find(a => a.id === tx.targetAccountId) : null;
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';
                  const isDeleting = deleteConfirmId === tx.id;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-2.5 px-3.5 font-mono text-slate-300 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isIncome
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isTransfer
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-100 max-w-[200px] truncate">
                        {tx.payee}
                        {tx.note && <span className="block text-[10px] font-normal text-slate-400">{tx.note}</span>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                        {tx.category}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {isTransfer ? `${acc?.name || 'A'} → ${targetAcc?.name || 'B'}` : acc?.name || 'Account'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {tx.paymentMethod || 'UPI'}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono-numbers font-bold text-sm whitespace-nowrap ${
                          isIncome ? 'text-emerald-400' : isTransfer ? 'text-blue-400' : 'text-slate-100'
                        }`}
                      >
                        {isIncome ? '+' : isTransfer ? '' : '−'}
                        {formatAmount(tx.amount)}
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditClick(tx)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              duplicateTransaction(tx.id);
                              soundFx.playCoin();
                            }}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Duplicate transaction"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {isDeleting ? (
                            <button
                              onClick={() => {
                                deleteTransaction(tx.id);
                                soundFx.playPop();
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] animate-pulse"
                              title="Confirm Delete"
                            >
                              Confirm?
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setDeleteConfirmId(tx.id);
                                setTimeout(() => setDeleteConfirmId(null), 3500);
                              }}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="py-3 px-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
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
