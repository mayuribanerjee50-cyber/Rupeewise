import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  LayoutDashboard,
  Receipt,
  BookOpen,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart,
  Target,
  Wallet,
  BarChart3,
  Repeat,
  Code2,
  Settings,
  Plus,
  RefreshCw,
  Volume2,
  VolumeX,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { soundFx } from '../services/sound';

export type ActiveTab =
  | 'dashboard'
  | 'transactions'
  | 'ledger'
  | 'income'
  | 'expenses'
  | 'savings'
  | 'budgets'
  | 'goals'
  | 'accounts'
  | 'reports'
  | 'recurring'
  | 'specs'
  | 'settings';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddTx: () => void;
}

export const Navigation: React.FC<Props> = ({ activeTab, setActiveTab, onOpenAddTx }) => {
  const { resetDemoData, profile } = useFinance();
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.muted);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'ledger', label: 'Ledger', icon: BookOpen },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Financial Goals', icon: Target },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
    { id: 'specs', label: 'Specs & OOP Explorer', icon: Code2, badge: 'Java' },
    { id: 'settings', label: 'Settings & Profile', icon: Settings },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    soundFx.playPop();
    setIsMobileMenuOpen(false);
  };

  const toggleSound = () => {
    const next = soundFx.toggleMute();
    setIsMuted(next);
  };

  return (
    <>
      {/* Top Mobile Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
            ₹
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm tracking-tight">RupeeWise</h1>
            <p className="text-[10px] text-emerald-400 font-medium">Java Spring Boot • INR</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddTx}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[57px] z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 overflow-y-auto border-t border-slate-800">
          <div className="space-y-1 mb-6">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={toggleSound}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>{isMuted ? 'Muted' : 'Sound On'}</span>
            </button>

            <button
              onClick={() => {
                resetDemoData();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900/90 border-r border-slate-800/80 min-h-screen fixed top-0 left-0 z-30 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 text-base tracking-tight">RupeeWise</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  INR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">Personal Finance & OOP</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-3 my-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-slate-200 truncate">{profile.fullName || 'RupeeWise User'}</p>
            <p className="text-[10px] text-emerald-400 font-mono">Academic Project Demo</p>
          </div>
          <button
            onClick={() => handleNavClick('settings')}
            className="p-1 text-slate-400 hover:text-white rounded"
            title="Profile Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="px-3 mb-2">
          <button
            onClick={onOpenAddTx}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction (₹)</span>
          </button>
        </div>

        {/* Navigation Items (13 sections from PDF) */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Controls: Sound, Demo Reset, Tech Stack Note */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <button
              onClick={toggleSound}
              className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300"
              title="Toggle Audio Feedback"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isMuted ? 'Muted' : 'Audio'}</span>
            </button>

            <button
              onClick={() => {
                if (resetConfirm) {
                  resetDemoData();
                  soundFx.playPop();
                  setResetConfirm(false);
                } else {
                  setResetConfirm(true);
                  setTimeout(() => setResetConfirm(false), 3000);
                }
              }}
              className={`flex items-center gap-1 py-1 px-2 rounded-lg transition-all ${
                resetConfirm
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
              }`}
              title="Reset Demo Records"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>{resetConfirm ? 'Confirm?' : 'Demo Data'}</span>
            </button>
          </div>

          <div className="px-2 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/60 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>Java 21 • Spring Boot</span>
            <span className="text-emerald-500">Asia, Jaipur</span>
          </div>
        </div>
      </aside>
    </>
  );
};
