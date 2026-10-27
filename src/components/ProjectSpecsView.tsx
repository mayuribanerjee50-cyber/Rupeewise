import React, { useState, useMemo } from 'react';
import {
  Code2,
  BookOpen,
  Layers,
  Terminal,
  Copy,
  Check,
  Search,
  ExternalLink,
  Play,
  Monitor,
  CheckCircle2,
  FileCode,
  Database,
  Server,
  Cpu,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { SOURCE_CODE_CATALOGUE, SourceFile } from '../data/sourceCodeCatalog';
import { OOP_CONCEPTS, OOPConcept } from '../data/oopExplanations';
import { soundFx } from '../services/sound';
import { ActiveTab } from './Navigation';

interface Props {
  onNavigateToDashboard?: (tab: ActiveTab) => void;
}

export const ProjectSpecsView: React.FC<Props> = ({ onNavigateToDashboard }) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'explorer' | 'oop' | 'playground' | 'presentation'>('overview');

  // Source-Code Explorer State (Section 17.B)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [explorerSearch, setExplorerSearch] = useState<string>('');
  const [selectedFileId, setSelectedFileId] = useState<string>(SOURCE_CODE_CATALOGUE[0]?.id || 'entity-account');
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);

  // OOP Concept State (Section 17.C)
  const [selectedOOPId, setSelectedOOPId] = useState<string>(OOP_CONCEPTS[0]?.id || 'classes-and-objects');

  // OOP Playground State (Section 17.D)
  const [playgroundConcept, setPlaygroundConcept] = useState<'encapsulation' | 'inheritance' | 'polymorphism' | 'abstraction'>('polymorphism');
  const [playgroundAccountBalance, setPlaygroundAccountBalance] = useState<number>(25000);
  const [playgroundAmount, setPlaygroundAmount] = useState<number>(1500);
  const [playgroundTxType, setPlaygroundTxType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [playgroundLogs, setPlaygroundLogs] = useState<string[]>([
    'JVM Initialized. Account created with balance ₹25,000.00.',
    'Ready for polymorphic dispatch execution.',
  ]);

  // Teacher Presentation Mode (Section 17.E)
  const [presentationStep, setPresentationStep] = useState<number>(1);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  // Categories list for Explorer
  const explorerCategories = useMemo(() => {
    const set = new Set(SOURCE_CODE_CATALOGUE.map(f => f.category));
    return Array.from(set);
  }, []);

  // Filtered files in explorer
  const filteredFiles = useMemo(() => {
    return SOURCE_CODE_CATALOGUE.filter(f => {
      if (selectedCategory !== 'ALL' && f.category !== selectedCategory) return false;
      if (explorerSearch.trim()) {
        const q = explorerSearch.toLowerCase();
        return (
          f.fileName.toLowerCase().includes(q) ||
          f.purpose.toLowerCase().includes(q) ||
          f.oopConcepts.some(c => c.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedCategory, explorerSearch]);

  const activeFile = useMemo(() => {
    return SOURCE_CODE_CATALOGUE.find(f => f.id === selectedFileId) || SOURCE_CODE_CATALOGUE[0];
  }, [selectedFileId]);

  const activeOOP = useMemo(() => {
    return OOP_CONCEPTS.find(o => o.id === selectedOOPId) || OOP_CONCEPTS[0];
  }, [selectedOOPId]);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    soundFx.playPop();
    setCopiedFileId(id);
    setTimeout(() => setCopiedFileId(null), 2500);
  };

  // Playground simulation handler
  const handleRunPlayground = () => {
    soundFx.playCoin();
    const timestamp = new Date().toLocaleTimeString();

    if (playgroundConcept === 'encapsulation') {
      if (playgroundAmount <= 0) {
        setPlaygroundLogs(prev => [
          `[${timestamp}] ❌ Encapsulation Guard: IllegalArgumentException thrown! "Amount must be strictly positive." Balance unchanged.`,
          ...prev,
        ]);
        return;
      }
      setPlaygroundAccountBalance(prev => prev + playgroundAmount);
      setPlaygroundLogs(prev => [
        `[${timestamp}] ✅ Encapsulation: account.credit(₹${playgroundAmount}) executed via validated public method. New balance: ₹${(playgroundAccountBalance + playgroundAmount).toLocaleString('en-IN')}.`,
        ...prev,
      ]);
    } else if (playgroundConcept === 'polymorphism') {
      if (playgroundTxType === 'income') {
        const nextBal = playgroundAccountBalance + playgroundAmount;
        setPlaygroundAccountBalance(nextBal);
        setPlaygroundLogs(prev => [
          `[${timestamp}] ⚡ Polymorphic Dispatch: tx = new IncomeTransaction(₹${playgroundAmount}); tx.applyToAccount() called -> Account credited! New balance: ₹${nextBal.toLocaleString('en-IN')}.`,
          ...prev,
        ]);
      } else if (playgroundTxType === 'expense') {
        const nextBal = Math.max(0, playgroundAccountBalance - playgroundAmount);
        setPlaygroundAccountBalance(nextBal);
        setPlaygroundLogs(prev => [
          `[${timestamp}] ⚡ Polymorphic Dispatch: tx = new ExpenseTransaction(₹${playgroundAmount}); tx.applyToAccount() called -> Account debited! New balance: ₹${nextBal.toLocaleString('en-IN')}.`,
          ...prev,
        ]);
      } else {
        setPlaygroundLogs(prev => [
          `[${timestamp}] ⚡ Double-Entry Polymorphism: tx = new TransferTransaction(₹${playgroundAmount}); Debits Source, Credits Target. Total wealth remains constant!`,
          ...prev,
        ]);
      }
    } else if (playgroundConcept === 'inheritance') {
      setPlaygroundLogs(prev => [
        `[${timestamp}] 🧬 Inheritance: Child class ${playgroundTxType.toUpperCase()}Transaction inherits id, amount, and date from abstract superclass FinancialTransaction.`,
        ...prev,
      ]);
    } else if (playgroundConcept === 'abstraction') {
      const calcRate = playgroundAccountBalance > 0 ? ((playgroundAmount / playgroundAccountBalance) * 100).toFixed(1) : '0';
      setPlaygroundLogs(prev => [
        `[${timestamp}] 🛡️ Abstraction: Invoked FinancialCalculator.calculateSavingsRate(). Implementation details and zero-division guards hidden behind interface contract. Result: ${calcRate}%.`,
        ...prev,
      ]);
    }
  };

  // Presentation Mode Sequence Steps (Section 17.E)
  const presentationSteps = [
    {
      step: 1,
      title: "1. Introduce Project Purpose & Scope",
      desc: "RupeeWise is a full-featured personal finance management platform architected in Java 21 LTS, Spring Boot 3.3, and H2 persistent database. Built specifically for an engineering demonstration, it tracks real multi-month student finances in Indian Rupees (INR ₹) while serving as an educational showcase of Object-Oriented Programming, RDBMS integrity, and clean 3-tier software architecture.",
    },
    {
      step: 2,
      title: "2. Three-Layer Software Architecture",
      desc: "Demonstrate the clean separation of concerns: Presentation Layer (responsive React/TypeScript UI), Business Logic Layer (Spring Boot @Service, domain models, validations), and Data Access Layer (Spring Data JPA, Hibernate, H2 file persistence at ./data/rupeewisedb).",
    },
    {
      step: 3,
      title: "3. Show Transaction & Account Domain Classes",
      desc: "Inspect Account.java and FinancialTransaction.java. Note the use of Java BigDecimal for financial precision (avoiding IEEE 754 float rounding errors), Bean Validation annotations (@NotNull, @DecimalMin), and audit timestamps.",
    },
    {
      step: 4,
      title: "4. Explain Classes, Objects, and Encapsulation",
      desc: "Highlight private fields in Account.java. Direct mutation (such as balance = -5000) is forbidden by the compiler. External callers must invoke validated credit() or debit() methods, guaranteeing that invalid financial states cannot exist.",
    },
    {
      step: 5,
      title: "5. Demonstrate Abstraction, Inheritance, and Polymorphism",
      desc: "Show FinancialTransaction abstract superclass with abstract applyToAccount() and reverseFromAccount() methods. Review child classes IncomeTransaction, ExpenseTransaction, and TransferTransaction. Dynamic method dispatch applies balance changes at runtime without ugly switch statements.",
    },
    {
      step: 6,
      title: "6. Show Spring Services, Repositories, and REST Controllers",
      desc: "Explore TransactionServiceImpl.java with @Transactional ACID guarantees. Show TransactionRepository custom JPQL queries. Show TransactionController exposing REST endpoints returning standard HTTP status codes (201 Created, 204 No Content).",
    },
    {
      step: 7,
      title: "7. Explain Database Schema, RDBMS Keys, and Persistence",
      desc: "Inspect schema.sql. Point out Primary Keys, Foreign Keys with ON DELETE RESTRICT to guarantee referential integrity, CHECK constraints, and B-Tree indexes on (transaction_date DESC) and (account_id).",
    },
    {
      step: 8,
      title: "8. Return to Dashboard for Live Demonstration",
      desc: "Click 'Return to Dashboard' to transition smoothly from code explanation to the running application.",
    },
    {
      step: 9,
      title: "9. Add a Live Transaction",
      desc: "Use the '+ Add Transaction (₹)' modal to record a real income (e.g. ₹9,000 Tuition Stipend) or expense (e.g. ₹1,500 Groceries). Observe immediate auditory and visual feedback.",
    },
    {
      step: 10,
      title: "10. Inspect Updated Ledger and Interactive Charts",
      desc: "Open the Ledger view to demonstrate chronological running balance recalculation and reconciliation with account closing balance. View the Chart.js doughnut and bar charts updating instantly.",
    },
    {
      step: 11,
      title: "11. Demonstrate Budget Warning and Savings Goal Allocation",
      desc: "Show the 75%, 90%, and 100% budget utilization warning thresholds, and contribute funds to a savings goal without double-counting account assets.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Presentation Mode Fullscreen Overlay (Section 17.E) */}
      {isPresentationMode && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col p-6 overflow-y-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-xs">
                TEACHER PRESENTATION MODE
              </span>
              <h2 className="text-lg font-bold text-white">
                RupeeWise — Academic Viva & Evaluation Sequence
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsPresentationMode(false);
                  if (onNavigateToDashboard) onNavigateToDashboard('dashboard');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPresentationMode(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Presentation Body */}
          <div className="flex-1 max-w-4xl mx-auto w-full my-8 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Step {presentationStep} of 11</span>
              <span>College Project Evaluation Walkthrough</span>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <h3 className="text-xl font-black text-emerald-400">
                {presentationSteps[presentationStep - 1].title}
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {presentationSteps[presentationStep - 1].desc}
              </p>

              {presentationStep === 3 && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                  <pre>{`// FinancialTransaction.java
public abstract class FinancialTransaction {
    protected String id;
    protected LocalDate transactionDate;
    protected BigDecimal amount; // Financial precision
    public abstract void applyToAccount(); // Polymorphic contract
}`}</pre>
                </div>
              )}

              {presentationStep === 5 && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                  <pre>{`// Runtime Polymorphism in TransactionServiceImpl.java
for (FinancialTransaction tx : batch) {
    tx.applyToAccount(); // Dynamically dispatches to Income or Expense subclass
}`}</pre>
                </div>
              )}
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center justify-between pt-4">
              <button
                disabled={presentationStep === 1}
                onClick={() => { setPresentationStep(prev => Math.max(1, prev - 1)); soundFx.playPop(); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>

              <div className="flex items-center gap-1.5">
                {presentationSteps.map(s => (
                  <button
                    key={s.step}
                    onClick={() => { setPresentationStep(s.step); soundFx.playPop(); }}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                      presentationStep === s.step
                        ? 'bg-emerald-500 text-slate-950 scale-110 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.step}
                  </button>
                ))}
              </div>

              {presentationStep < 11 ? (
                <button
                  onClick={() => { setPresentationStep(prev => Math.min(11, prev + 1)); soundFx.playPop(); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsPresentationMode(false);
                    if (onNavigateToDashboard) onNavigateToDashboard('dashboard');
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20"
                >
                  <span>Finish & Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. Specs Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Code2 className="w-6 h-6 text-emerald-400" />
              <span>Project Specs & Source-Code Explorer</span>
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
              Section 17 Spec
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            College software engineering specification: Architecture, actual Java implementation files, 19 OOP explanations, and interactive playground.
          </p>
        </div>

        <button
          onClick={() => { setIsPresentationMode(true); soundFx.playSuccess(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
        >
          <GraduationCap className="w-4 h-4 stroke-[2.5]" />
          <span>Launch Teacher Presentation Mode</span>
        </button>
      </div>

      {/* 2. Sub-Tab Switcher */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => { setActiveSubTab('overview'); soundFx.playPop(); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>A. Architecture Overview</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('explorer'); soundFx.playPop(); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'explorer'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>B. Complete Source-Code Explorer</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('oop'); soundFx.playPop(); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'oop'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>C. 19 OOP Concepts Explained</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('playground'); soundFx.playPop(); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeSubTab === 'playground'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>D. OOP Demonstration Playground</span>
        </button>
      </div>

      {/* 3. Sub-Tab A: Architecture Overview (Section 17.A) */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Tech Stack Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Backend</span>
              <p className="text-sm font-bold text-white mt-1">Java 21 LTS + Spring Boot 3.3</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">REST APIs • Maven Build</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Persistence</span>
              <p className="text-sm font-bold text-white mt-1">H2 File Database</p>
              <p className="text-[11px] text-cyan-400 mt-0.5">Spring Data JPA • Hibernate</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Presentation</span>
              <p className="text-sm font-bold text-white mt-1">React 19 + TypeScript</p>
              <p className="text-[11px] text-purple-400 mt-0.5">Tailwind CSS • Chart.js</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Accounting</span>
              <p className="text-sm font-bold text-white mt-1">Double-Entry Ledger</p>
              <p className="text-[11px] text-amber-400 mt-0.5">BigDecimal • INR (₹)</p>
            </div>
          </div>

          {/* 3-Tier Architecture Diagram */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Three-Tier Architectural Model & Data Flow</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Layer 1 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                  Tier 1: Presentation Layer
                </span>
                <h4 className="font-bold text-white text-sm">React Frontend Client</h4>
                <ul className="space-y-1 text-slate-400">
                  <li>• Interactive Chart.js graphs & visualizers</li>
                  <li>• Asynchronous Fetch API client calls</li>
                  <li>• Double-entry ledger with instant search</li>
                  <li>• Safe in-memory resilient fallback</li>
                </ul>
              </div>

              {/* Layer 2 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  Tier 2: Business Logic Layer
                </span>
                <h4 className="font-bold text-white text-sm">Java Spring Boot Services</h4>
                <ul className="space-y-1 text-slate-400">
                  <li>• TransactionService (@Transactional)</li>
                  <li>• Polymorphic applyToAccount() execution</li>
                  <li>• LedgerService chronological balance math</li>
                  <li>• Jakarta Bean validation & GlobalExceptionHandler</li>
                </ul>
              </div>

              {/* Layer 3 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                  Tier 3: Data Access Layer
                </span>
                <h4 className="font-bold text-white text-sm">H2 Relational Database</h4>
                <ul className="space-y-1 text-slate-400">
                  <li>• Persistent file: ./data/rupeewisedb</li>
                  <li>• Spring Data JPA Repositories (JPQL)</li>
                  <li>• Foreign key referential integrity (ON DELETE)</li>
                  <li>• Composite B-Tree performance indexing</li>
                </ul>
              </div>
            </div>
          </div>

          {/* RDBMS Entity Relationship Spec */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Relational Entity Relationship (ER) & Schema Specs</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every table enforces relational constraints. The primary entity <code className="text-emerald-400 font-mono">financial_transactions</code> links to <code className="text-cyan-400 font-mono">accounts</code> via foreign key with <code className="text-amber-400 font-mono">ON DELETE RESTRICT</code>, guaranteeing that no account with existing ledger history can be orphaned or deleted inadvertently.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Table Name</th>
                    <th className="p-2.5">Primary Key</th>
                    <th className="p-2.5">Foreign Keys & Relationships</th>
                    <th className="p-2.5">Integrity Constraints</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  <tr>
                    <td className="p-2.5 font-bold text-white">user_profiles</td>
                    <td className="p-2.5 text-emerald-400">id (VARCHAR 50)</td>
                    <td className="p-2.5 text-slate-400">1:1 Profile Entity</td>
                    <td className="p-2.5 text-slate-300">NOT NULL full_name</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">accounts</td>
                    <td className="p-2.5 text-emerald-400">id (VARCHAR 50)</td>
                    <td className="p-2.5 text-slate-400">1:N Transactions</td>
                    <td className="p-2.5 text-slate-300">CHECK account_type IN (...)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">financial_transactions</td>
                    <td className="p-2.5 text-emerald-400">id (VARCHAR 50)</td>
                    <td className="p-2.5 text-cyan-400">fk_tx_account -&gt; accounts(id)</td>
                    <td className="p-2.5 text-slate-300">CHECK (amount &gt; 0), ON DELETE RESTRICT</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">budgets</td>
                    <td className="p-2.5 text-emerald-400">id (VARCHAR 50)</td>
                    <td className="p-2.5 text-slate-400">Unique Category Limit</td>
                    <td className="p-2.5 text-slate-300">UNIQUE (category), CHECK (limit &gt; 0)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">savings_goals</td>
                    <td className="p-2.5 text-emerald-400">id (VARCHAR 50)</td>
                    <td className="p-2.5 text-slate-400">Independent Asset Allocation</td>
                    <td className="p-2.5 text-slate-300">CHECK (target_amount &gt; 0)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sub-Tab B: Source-Code Explorer (Section 17.B) */}
      {activeSubTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* File Browser Sidebar (4 cols) */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={explorerSearch}
                onChange={e => setExplorerSearch(e.target.value)}
                placeholder="Search classes, OOP concepts..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="space-y-1 max-h-[580px] overflow-y-auto scrollbar-thin">
              {filteredFiles.map(file => {
                const isSelected = file.id === selectedFileId;
                return (
                  <button
                    key={file.id}
                    onClick={() => { setSelectedFileId(file.id); soundFx.playPop(); }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-[11px] truncate">{file.fileName}</span>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {file.language}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{file.purpose}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {file.oopConcepts.slice(0, 2).map((c, i) => (
                        <span key={i} className="text-[9px] px-1 rounded bg-slate-950 text-slate-400 font-mono">
                          {c}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer (8 cols) */}
          <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>{activeFile.fileName}</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{activeFile.relativePath}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(activeFile.code, activeFile.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  {copiedFileId === activeFile.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Purpose & OOP concepts */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-2">
              <p className="text-slate-300 leading-relaxed font-sans">{activeFile.purpose}</p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold">OOP Concepts Demonstrated:</span>
                {activeFile.oopConcepts.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Code Block with Line Numbers */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden text-xs font-mono">
              <div className="max-h-[460px] overflow-y-auto p-4 flex gap-4">
                {/* Line Numbers */}
                <div className="select-none text-slate-600 text-right pr-2 border-r border-slate-800/80 space-y-0.5">
                  {activeFile.code.split('\n').map((_, i) => (
                    <div key={i} className="text-[11px] leading-5">{i + 1}</div>
                  ))}
                </div>

                {/* Actual Source Code */}
                <pre className="text-slate-200 overflow-x-auto flex-1 text-[11px] leading-5 font-mono">
                  {activeFile.code}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Sub-Tab C: 19 OOP Concepts Explained (Section 17.C) */}
      {activeSubTab === 'oop' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* OOP Selector List (4 cols) */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 max-h-[640px] overflow-y-auto scrollbar-thin">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 block mb-2">
              All 19 Mandatory OOP Concepts
            </span>
            {OOP_CONCEPTS.map(c => {
              const isSelected = c.id === selectedOOPId;
              return (
                <button
                  key={c.id}
                  onClick={() => { setSelectedOOPId(c.id); soundFx.playPop(); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px] text-slate-500 w-4">{c.number}.</span>
                    <span className="truncate">{c.title}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* OOP Concept Detailed Card (8 cols) */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Concept #{activeOOP.number}
                </span>
                <h3 className="text-xl font-bold text-white">{activeOOP.title}</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed font-sans">
              <div>
                <h4 className="font-bold text-emerald-400 text-xs mb-1">Theoretical Explanation:</h4>
                <p className="text-slate-300">{activeOOP.theory}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <h4 className="font-bold text-cyan-400 text-xs mb-1">Real-World Finance Analogy:</h4>
                <p className="text-slate-300">{activeOOP.realWorldFinanceExample}</p>
              </div>

              <div>
                <h4 className="font-bold text-purple-400 text-xs mb-1">RupeeWise Project Implementation:</h4>
                <p className="text-slate-300">{activeOOP.projectUsage}</p>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="mt-4 rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-slate-200 overflow-x-auto">
              <pre>{activeOOP.codeSnippet}</pre>
            </div>
          </div>
        </div>
      )}

      {/* 6. Sub-Tab D: OOP Demonstration Playground (Section 17.D) */}
      {activeSubTab === 'playground' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Interactive OOP Demonstration Playground</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select an OOP concept below to witness live object state behavior, polymorphic dispatch, and encapsulation guards in action.
            </p>
          </div>

          {/* Concept Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'polymorphism', label: 'Polymorphism', desc: 'Dynamic dispatch on tx.applyToAccount()' },
              { id: 'encapsulation', label: 'Encapsulation', desc: 'Data hiding & credit()/debit() validation' },
              { id: 'inheritance', label: 'Inheritance', desc: 'FinancialTransaction subclass hierarchy' },
              { id: 'abstraction', label: 'Abstraction', desc: 'FinancialCalculator interface contract' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setPlaygroundConcept(item.id as any); soundFx.playPop(); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  playgroundConcept === item.id
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-md'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <p className="text-xs font-bold">{item.label}</p>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{item.desc}</p>
              </button>
            ))}
          </div>

          {/* Interactive Simulation Sandbox */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-slate-950 border border-slate-800">
            {/* Input Controls */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Simulated Account Balance</span>
                <p className="text-xl font-bold font-mono-numbers text-emerald-400 mt-0.5">
                  ₹{playgroundAccountBalance.toLocaleString('en-IN')}.00
                </p>
              </div>

              {playgroundConcept === 'polymorphism' && (
                <div>
                  <label className="text-slate-300 block mb-1">Polymorphic Subclass Instance</label>
                  <select
                    value={playgroundTxType}
                    onChange={e => setPlaygroundTxType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="expense">new ExpenseTransaction() [Calls debit()]</option>
                    <option value="income">new IncomeTransaction() [Calls credit()]</option>
                    <option value="transfer">new TransferTransaction() [Double-Entry movement]</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-slate-300 block mb-1">Transaction Amount (₹)</label>
                <input
                  type="number"
                  value={playgroundAmount}
                  onChange={e => setPlaygroundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>

              <button
                onClick={handleRunPlayground}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute OOP Operation</span>
              </button>
            </div>

            {/* Execution Log Output */}
            <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 flex flex-col font-mono text-[11px]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                <span>JVM Console Output</span>
                <span className="text-emerald-400">Simulation Active</span>
              </div>
              <div className="flex-1 space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin text-slate-300">
                {playgroundLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
