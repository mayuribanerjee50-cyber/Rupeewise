import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Wallet,
  Plus,
  ArrowRightLeft,
  Building2,
  Banknote,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Trash2,
  Lock,
  Edit2,
  X,
} from 'lucide-react';
import { soundFx } from '../services/sound';
import { Account, AccountType } from '../types/finance';

export const AccountsView: React.FC = () => {
  const { accounts, formatAmount, addAccount, updateAccount, deleteAccount, transferFunds, transactions } = useFinance();

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Edit account state
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editName, setEditName] = useState('');
  const [editInstitution, setEditInstitution] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editOpeningBalance, setEditOpeningBalance] = useState('');
  const [editMask, setEditMask] = useState('');

  // New account state
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('savings');
  const [openingBalance, setOpeningBalance] = useState('10000');
  const [institution, setInstitution] = useState('State Bank of India');
  const [accountNumberMask, setAccountNumberMask] = useState('•••• 1234');

  // Transfer state
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [transferAmount, setTransferAmount] = useState('2000');
  const [transferNote, setTransferNote] = useState('ATM Cash Withdrawal');

  const handleStartEditAccount = (acc: Account) => {
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditInstitution(acc.institution || '');
    setEditBalance(String(acc.balance));
    setEditOpeningBalance(String(acc.openingBalance ?? acc.balance));
    setEditMask(acc.accountNumberMask || '');
    soundFx.playPop();
  };

  const handleSaveAccountEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    const bal = parseFloat(editBalance);
    const opBal = parseFloat(editOpeningBalance);
    if (!editName.trim() || isNaN(bal)) return;

    updateAccount({
      ...editingAccount,
      name: editName.trim(),
      institution: editInstitution.trim(),
      balance: bal,
      openingBalance: isNaN(opBal) ? bal : opBal,
      accountNumberMask: editMask.trim() || 'Manual Account',
    });

    soundFx.playSuccess();
    setEditingAccount(null);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(openingBalance);
    if (!accountName.trim() || isNaN(bal)) return;

    addAccount({
      name: accountName.trim(),
      type: accountType,
      balance: bal,
      openingBalance: bal,
      currency: 'INR',
      institution: institution.trim(),
      accountNumberMask: accountNumberMask.trim() || 'Manual Account',
      color: accountType === 'cash' ? '#F59E0B' : accountType === 'savings' ? '#10B981' : '#3B82F6',
    });

    soundFx.playSuccess();
    setIsAddAccountOpen(false);
    setAccountName('');
    setOpeningBalance('10000');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) return;
    if (fromAccountId === toAccountId) {
      alert('Source and target account cannot be identical.');
      return;
    }

    transferFunds(fromAccountId, toAccountId, amt, transferNote);
    soundFx.playCoin();
    setIsTransferOpen(false);
    setTransferAmount('2000');
  };

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Wallet className="w-6 h-6 text-emerald-400" />
              <span>Accounts & Double-Entry Transfers</span>
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
              Section 13 Spec
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manual cash wallets, savings bank accounts, and current accounts with strict non-inflating transfers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setIsTransferOpen(true); soundFx.playPop(); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-xs shadow-md shadow-blue-500/20"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer Funds (₹)</span>
          </button>

          <button
            onClick={() => { setIsAddAccountOpen(true); soundFx.playPop(); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* 2. Total Net Assets Card */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">Total Consolidated Liquidity</span>
          <p className="text-3xl font-extrabold text-white font-mono-numbers mt-1">
            {formatAmount(totalBalance)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Manually reconciled across {accounts.length} monitored repositories
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Accounts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map(account => {
          const isCash = account.type === 'cash';
          const isSavings = account.type === 'savings';
          const isCurrent = account.type === 'checking';

          // Count associated transactions
          const txCount = transactions.filter(
            t => t.accountId === account.id || t.targetAccountId === account.id
          ).length;

          return (
            <div
              key={account.id}
              className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isCash
                          ? 'bg-amber-500/20 text-amber-400'
                          : isSavings
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {isCash ? <Banknote className="w-5 h-5" /> : isSavings ? <Building2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{account.name}</h4>
                      <p className="text-[10px] text-slate-400">{account.institution || 'Manual'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEditAccount(account)}
                      className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Edit Account Details & Adjust Balance"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => {
                          deleteAccount(account.id);
                          soundFx.playPop();
                        }}
                        className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Archive account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Current Balance</span>
                    <button
                      onClick={() => handleStartEditAccount(account)}
                      className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 underline"
                    >
                      Edit Balance
                    </button>
                  </div>
                  <p className="text-2xl font-black text-white font-mono-numbers mt-0.5">
                    {formatAmount(account.balance)}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono text-xs">{account.accountNumberMask || 'Active'}</span>
                <span>{txCount} records</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Double-Entry Transfer Modal (Section 13) */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-400" />
              <span>Inter-Account Double-Entry Transfer</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Decreases source account and increases destination account by exact amount. Transfers do not inflate spending or earnings.
            </p>

            <form onSubmit={handleTransferSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">From Account (Debit)</label>
                  <select
                    value={fromAccountId}
                    onChange={e => setFromAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({formatAmount(a.balance)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">To Account (Credit)</label>
                  <select
                    value={toAccountId}
                    onChange={e => setToAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({formatAmount(a.balance)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Transfer Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono-numbers"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Transfer Description / Reason</label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={e => setTransferNote(e.target.value)}
                  placeholder="e.g. ATM Cash Withdrawal, Bank transfer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs"
                >
                  Execute Transfer (₹)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <span>Create New Account</span>
            </h3>

            <form onSubmit={handleCreateAccount} className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Account Name *</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  placeholder="e.g. Canara Bank Savings, Physical Cash Wallet"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Account Type</label>
                  <select
                    value={accountType}
                    onChange={e => setAccountType(e.target.value as AccountType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="savings">Savings Bank</option>
                    <option value="checking">Current Bank</option>
                    <option value="cash">Cash Wallet</option>
                    <option value="investment">Other / Manual</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Opening Balance (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={openingBalance}
                    onChange={e => setOpeningBalance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Bank / Institution Name</label>
                <input
                  type="text"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="e.g. State Bank of India, Physical Wallet"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account & Balance Adjustment Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-400" />
                <span>Edit Account & Adjust Balance</span>
              </h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Correct current balances, account names, or bank details. Balance adjustments immediately update all net calculations and running balances.
            </p>

            <form onSubmit={handleSaveAccountEdit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Account Display Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Current Balance (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editBalance}
                    onChange={e => setEditBalance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono-numbers focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Opening Balance (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editOpeningBalance}
                    onChange={e => setEditOpeningBalance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono-numbers focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Bank / Institution</label>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={e => setEditInstitution(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Account Number Mask</label>
                  <input
                    type="text"
                    value={editMask}
                    onChange={e => setEditMask(e.target.value)}
                    placeholder="•••• 1234"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
