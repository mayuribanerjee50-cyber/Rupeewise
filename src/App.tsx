/**
 * RupeeWise — Personal Finance & Management System
 * Main React Application Architecture
 */

import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { LedgerView } from './components/LedgerView';
import { IncomeView } from './components/IncomeView';
import { ExpensesView } from './components/ExpensesView';
import { SavingsView } from './components/SavingsView';
import { BudgetsView } from './components/BudgetsView';
import { AccountsView } from './components/AccountsView';
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView';
import { RecurringView } from './components/RecurringView';
import { ProjectSpecsView } from './components/ProjectSpecsView';
import { SettingsView } from './components/SettingsView';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { FirstLaunchSetupModal } from './components/modals/FirstLaunchSetupModal';

function RupeeWiseApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation (Desktop persistent sidebar + Mobile header/drawer) */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddTx={() => setIsAddTxOpen(true)}
      />

      {/* Main Content Area (Offset for lg:pl-64 desktop sidebar) */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-20">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveTab}
              onOpenAddTx={() => setIsAddTxOpen(true)}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView onOpenAddTx={() => setIsAddTxOpen(true)} />
          )}

          {activeTab === 'ledger' && <LedgerView />}

          {activeTab === 'income' && (
            <IncomeView onOpenAddTx={() => setIsAddTxOpen(true)} />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView onOpenAddTx={() => setIsAddTxOpen(true)} />
          )}

          {activeTab === 'savings' && <SavingsView />}

          {activeTab === 'budgets' && <BudgetsView />}

          {activeTab === 'goals' && <SavingsView />}

          {activeTab === 'accounts' && <AccountsView />}

          {activeTab === 'reports' && <ReportsAnalyticsView />}

          {activeTab === 'recurring' && <RecurringView />}

          {activeTab === 'specs' && (
            <ProjectSpecsView onNavigateToDashboard={setActiveTab} />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />

      {/* First Launch Onboarding Setup Modal */}
      <FirstLaunchSetupModal />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <RupeeWiseApp />
    </FinanceProvider>
  );
}
