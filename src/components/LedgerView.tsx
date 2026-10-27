import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  BookOpen,
  Download,
  Printer,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  Wallet,
  FileSpreadsheet,
  Edit2,
  Trash2,
} from 'lucide-react';
import { exportTransactionsToCSV } from '../services/storage';
import { soundFx } from '../services/sound';
import { Transaction } from '../types/finance';
import { EditTransactionModal } from './modals/EditTransactionModal';

export const LedgerView: React.FC = () => {
  const { transactions, accounts, formatAmount, formatDate, deleteTransaction } = useFinance();

  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const itemsPerPage = 12;

  // Chronological computation for accurate running balance register
  const ledgerReport = useMemo(() => {
    // 1. Sort strictly in ascending chronological order
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 2. Determine initial opening balance
    let initialOpening = 0;
    if (selectedAccount !== 'ALL') {
      const acc = accounts.find(a => a.id === selectedAccount);
      initialOpening = acc ? (acc.openingBalance ?? acc.balance) : 0;
    } else {
      initialOpening = accounts.reduce((s, a) => s + (a.openingBalance ?? a.balance), 0);
    }

    let running = initialOpening;
    let totalCredits = 0;
    let totalDebits = 0;

    const allEntries = sorted.map(t => {
      let debit = 0;
      let credit = 0;

      const isForAccount =
        selectedAccount === 'ALL' ||
        t.accountId === selectedAccount ||
        t.targetAccountId === selectedAccount;

      if (!isForAccount) {
        return null;
      }

      if (t.type === 'income') {
        credit = t.amount;
        running += t.amount;
        totalCredits += t.amount;
      } else if (t.type === 'expense') {
        debit = t.amount;
        running -= t.amount;
        totalDebits += t.amount;
      } else if (t.type === 'transfer') {
        if (selectedAccount !== 'ALL') {
          if (t.accountId === selectedAccount) {
            debit = t.amount;
            running -= t.amount;
          } else if (t.targetAccountId === selectedAccount) {
            credit = t.amount;
            running += t.amount;
          }
        }
        // In global ledger, transfer does not alter total net wealth
      }

      return {
        id: t.id,
        date: t.date,
        description: t.payee,
        category: t.category,
        debit,
        credit,
        accountId: t.accountId,
        targetAccountId: t.targetAccountId,
        type: t.type,
        runningBalance: running,
        notes: t.note || '',
        paymentMethod: t.paymentMethod || 'UPI',
      };
    }).filter(Boolean);

    // Apply filters (search, date range)
    let filtered = allEntries as NonNullable<typeof allEntries[0]>[];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q)
      );
    }

    if (startDate) {
      filtered = filtered.filter(e => e.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(e => e.date <= endDate);
    }

    // Display in reverse chronological order for human inspection
    const displayList = [...filtered].reverse();

    return {
      openingBalance: initialOpening,
      totalCredits,
      totalDebits,
      closingBalance: running,
      entries: displayList,
    };
  }, [transactions, accounts, selectedAccount, searchQuery, startDate, endDate]);

  const totalPages = Math.ceil(ledgerReport.entries.length / itemsPerPage) || 1;
  const paginatedEntries = ledgerReport.entries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    soundFx.playCoin();
    const csv = exportTransactionsToCSV(transactions, accounts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RupeeWise_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => {
    soundFx.playPop();
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-400" />
              <span>General Financial Ledger</span>
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
              Double-Entry Register
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological accounting ledger with real-time balance reconciliation.
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
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* 2. Accounting Reconciliation Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div>
          <span className="text-[11px] text-slate-400">Opening Balance</span>
          <p className="text-base font-bold text-slate-200 font-mono-numbers mt-0.5">
            {formatAmount(ledgerReport.openingBalance)}
          </p>
        </div>
        <div>
          <span className="text-[11px] text-slate-400">Total Credits (Income)</span>
          <p className="text-base font-bold text-emerald-400 font-mono-numbers mt-0.5">
            +{formatAmount(ledgerReport.totalCredits)}
          </p>
        </div>
        <div>
          <span className="text-[11px] text-slate-400">Total Debits (Expenses)</span>
          <p className="text-base font-bold text-rose-400 font-mono-numbers mt-0.5">
            −{formatAmount(ledgerReport.totalDebits)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Closing Balance</span>
            <span title="Reconciled with Account Balance">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </span>
          </div>
          <p className="text-base font-bold text-white font-mono-numbers mt-0.5">
            {formatAmount(ledgerReport.closingBalance)}
          </p>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search description, ID, category..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={e => { setSelectedAccount(e.target.value); setCurrentPage(1); soundFx.playPop(); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Accounts (Consolidated)</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({formatAmount(a.balance)})
              </option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
          />
          <span className="text-xs text-slate-500">to</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
          />
        </div>
      </div>

      {/* 4. Professional Ledger Register Table (Section 8 Columns) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Date (DD-MM-YYYY)</th>
                <th className="py-3 px-3">Tx ID</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Account</th>
                <th className="py-3 px-3 text-right">Debit (Expense)</th>
                <th className="py-3 px-3 text-right">Credit (Income)</th>
                <th className="py-3 px-4 text-right">Running Balance</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 text-xs">
                    No transactions recorded matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedEntries.map(entry => {
                  const acc = accounts.find(a => a.id === entry.accountId);
                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-slate-300 whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {entry.id}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-100 max-w-[200px] truncate">
                        {entry.description}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {entry.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {acc?.name || 'Account'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-numbers font-medium text-rose-400 whitespace-nowrap">
                        {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-numbers font-medium text-emerald-400 whitespace-nowrap">
                        {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono-numbers font-bold text-white whitespace-nowrap bg-slate-950/20">
                        {formatAmount(entry.runningBalance)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] max-w-[150px] truncate">
                        {entry.notes || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              const found = transactions.find(t => t.id === entry.id);
                              if (found) {
                                setEditingTx(found);
                                soundFx.playPop();
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ledger entry "${entry.description}"?`)) {
                                deleteTransaction(entry.id);
                                soundFx.playPop();
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination */}
        {totalPages > 1 && (
          <div className="py-3 px-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
            <span>
              Showing page {currentPage} of {totalPages} ({ledgerReport.entries.length} records)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Ledger Transaction Modal */}
      {editingTx && (
        <EditTransactionModal
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
        />
      )}
    </div>
  );
};
