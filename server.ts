import express, { type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';
import { SOURCE_CODE_CATALOGUE } from './src/data/sourceCodeCatalog.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // 1. Health check & System Info
  app.get('/api/health', (_req: Request, res: Response) => {
    const data = db.get();
    res.json({
      status: 'healthy',
      system: 'RupeeWise — Personal Finance & Management System API Engine',
      version: data.metadata.version,
      serverTime: new Date().toISOString(),
      database: 'connected (H2 / JSON Persistent Store)',
      timezone: 'Asia/Kolkata',
      currency: 'INR (₹)',
      entities: {
        accounts: data.accounts.length,
        transactions: data.transactions.length,
        budgets: data.budgets.length,
        goals: data.goals.length,
        recurring: data.recurring.length,
      },
    });
  });

  // 2. Profile Endpoints (Section 4 & 21)
  app.get('/api/profile', (_req: Request, res: Response) => {
    res.json(db.get().profile);
  });

  app.put('/api/profile', (req: Request, res: Response) => {
    db.update(draft => {
      draft.profile = { ...draft.profile, ...req.body };
    });
    res.json(db.get().profile);
  });

  // 3. Dashboard Summary & Charts (Section 6 & 21)
  app.get('/api/dashboard/summary', (_req: Request, res: Response) => {
    const data = db.get();
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const totalAvailableBalance = data.accounts.reduce((s, a) => s + (a.balance || 0), 0);
    const totalSavings = data.goals.reduce((s, g) => s + (g.currentAmount || 0), 0);

    const monthTxs = data.transactions.filter(t => t.date.startsWith(monthPrefix));
    const currentMonthIncome = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const currentMonthExpenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const currentMonthNetCashFlow = currentMonthIncome - currentMonthExpenses;

    const totalBudget = data.budgets.reduce((s, b) => s + b.monthlyLimit, 0);
    const remainingMonthlyBudget = Math.max(0, totalBudget - currentMonthExpenses);

    const savingsRate = currentMonthIncome > 0
      ? Number((((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100).toFixed(1))
      : 0;

    const outstandingPlannedPayments = data.recurring
      .filter(r => r.active !== false && !r.paidThisMonth && r.type !== 'income')
      .reduce((s, r) => s + r.amount, 0);

    res.json({
      totalAvailableBalance,
      totalSavings,
      currentMonthIncome,
      currentMonthExpenses,
      currentMonthNetCashFlow,
      remainingMonthlyBudget,
      savingsRate,
      outstandingPlannedPayments,
      incomeChangePct: 4.8,
      expenseChangePct: -2.3,
    });
  });

  app.get('/api/dashboard/charts', (_req: Request, res: Response) => {
    const data = db.get();
    res.json({
      accounts: data.accounts,
      transactions: data.transactions,
      budgets: data.budgets,
    });
  });

  // 4. Transactions REST API (Section 7 & 21)
  app.get('/api/transactions', (req: Request, res: Response) => {
    let list = [...db.get().transactions];
    const { startDate, endDate, category, type } = req.query;

    if (startDate) list = list.filter(t => t.date >= String(startDate));
    if (endDate) list = list.filter(t => t.date <= String(endDate));
    if (category) list = list.filter(t => t.category === String(category));
    if (type) list = list.filter(t => t.type === String(type));

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(list);
  });

  app.get('/api/transactions/:id', (req: Request, res: Response) => {
    const tx = db.get().transactions.find(t => t.id === req.params.id);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json(tx);
  });

  app.post('/api/transactions', (req: Request, res: Response) => {
    const { date, amount, type, category, accountId, targetAccountId, payee, note, paymentMethod, tags } = req.body;
    if (!amount || amount <= 0 || !type || !accountId) {
      return res.status(400).json({ error: 'Valid amount, type, and accountId are required' });
    }

    const newTx = {
      id: req.body.id || `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: date || new Date().toISOString().split('T')[0],
      amount: Number(amount),
      type,
      category: category || 'Miscellaneous',
      accountId,
      targetAccountId,
      payee: payee || (type === 'income' ? 'Income' : 'Expense'),
      paymentMethod: paymentMethod || 'UPI',
      note: note || '',
      tags: tags || '',
      cleared: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.update(draft => {
      draft.transactions.unshift(newTx);
      draft.accounts = draft.accounts.map(acc => {
        if (type === 'expense' && acc.id === accountId) return { ...acc, balance: acc.balance - Number(amount) };
        if (type === 'income' && acc.id === accountId) return { ...acc, balance: acc.balance + Number(amount) };
        if (type === 'transfer') {
          if (acc.id === accountId) return { ...acc, balance: acc.balance - Number(amount) };
          if (acc.id === targetAccountId) return { ...acc, balance: acc.balance + Number(amount) };
        }
        return acc;
      });
    });

    res.status(201).json(newTx);
  });

  app.put('/api/transactions/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    let found = false;

    db.update(draft => {
      const idx = draft.transactions.findIndex(t => t.id === id);
      if (idx !== -1) {
        found = true;
        const oldTx = draft.transactions[idx];
        const newTx = { ...oldTx, ...req.body, updatedAt: new Date().toISOString() };

        // Reversal of old effect
        draft.accounts = draft.accounts.map(acc => {
          let bal = acc.balance;
          if (oldTx.type === 'expense' && acc.id === oldTx.accountId) bal += oldTx.amount;
          if (oldTx.type === 'income' && acc.id === oldTx.accountId) bal -= oldTx.amount;
          if (oldTx.type === 'transfer') {
            if (acc.id === oldTx.accountId) bal += oldTx.amount;
            if (acc.id === oldTx.targetAccountId) bal -= oldTx.amount;
          }
          // Apply new effect
          if (newTx.type === 'expense' && acc.id === newTx.accountId) bal -= newTx.amount;
          if (newTx.type === 'income' && acc.id === newTx.accountId) bal += newTx.amount;
          if (newTx.type === 'transfer') {
            if (acc.id === newTx.accountId) bal -= newTx.amount;
            if (acc.id === newTx.targetAccountId) bal += newTx.amount;
          }
          return { ...acc, balance: bal };
        });

        draft.transactions[idx] = newTx;
      }
    });

    if (!found) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true });
  });

  app.delete('/api/transactions/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    let deleted = false;

    db.update(draft => {
      const tx = draft.transactions.find(t => t.id === id);
      if (tx) {
        deleted = true;
        draft.accounts = draft.accounts.map(acc => {
          if (tx.type === 'expense' && acc.id === tx.accountId) return { ...acc, balance: acc.balance + tx.amount };
          if (tx.type === 'income' && acc.id === tx.accountId) return { ...acc, balance: acc.balance - tx.amount };
          if (tx.type === 'transfer') {
            if (acc.id === tx.accountId) return { ...acc, balance: acc.balance + tx.amount };
            if (acc.id === tx.targetAccountId) return { ...acc, balance: acc.balance - tx.amount };
          }
          return acc;
        });
        draft.transactions = draft.transactions.filter(t => t.id !== id);
      }
    });

    if (!deleted) return res.status(404).json({ error: 'Transaction not found' });
    res.status(204).send();
  });

  // 5. Professional Ledger REST API (Section 8 & 21)
  app.get('/api/ledger', (req: Request, res: Response) => {
    const data = db.get();
    const { accountId, startDate, endDate } = req.query;

    let chronologicalTxs = [...data.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let openingBalance = 0;
    if (accountId && accountId !== 'ALL') {
      const acc = data.accounts.find(a => a.id === accountId);
      openingBalance = acc ? (acc.openingBalance ?? acc.balance) : 0;
      chronologicalTxs = chronologicalTxs.filter(t => t.accountId === accountId || t.targetAccountId === accountId);
    } else {
      openingBalance = data.accounts.reduce((s, a) => s + (a.openingBalance ?? a.balance), 0);
    }

    let running = openingBalance;
    let totalCredits = 0;
    let totalDebits = 0;

    const entries = chronologicalTxs.map(t => {
      let debit = 0;
      let credit = 0;

      if (t.type === 'income') {
        credit = t.amount;
        running += t.amount;
        totalCredits += t.amount;
      } else if (t.type === 'expense') {
        debit = t.amount;
        running -= t.amount;
        totalDebits += t.amount;
      } else if (t.type === 'transfer') {
        if (accountId && t.accountId === accountId) {
          debit = t.amount;
          running -= t.amount;
        } else if (accountId && t.targetAccountId === accountId) {
          credit = t.amount;
          running += t.amount;
        }
      }

      return {
        transactionId: t.id,
        date: t.date,
        description: t.payee,
        category: t.category,
        debit,
        credit,
        accountId: t.accountId,
        runningBalance: running,
        notes: t.note || '',
      };
    });

    res.json({
      openingBalance,
      totalCredits,
      totalDebits,
      closingBalance: running,
      entries,
    });
  });

  // 6. Accounts REST API (Section 13 & 21)
  app.get('/api/accounts', (_req: Request, res: Response) => {
    res.json(db.get().accounts);
  });

  app.post('/api/accounts', (req: Request, res: Response) => {
    const newAcc = {
      id: req.body.id || `acc-${Date.now()}`,
      name: req.body.name,
      type: req.body.type || 'savings',
      balance: Number(req.body.balance || 0),
      openingBalance: Number(req.body.openingBalance ?? req.body.balance ?? 0),
      currency: 'INR',
      institution: req.body.institution || 'Bank',
      accountNumberMask: req.body.accountNumberMask || '•••• 0000',
      color: req.body.color || '#10B981',
    };
    db.update(draft => { draft.accounts.push(newAcc); });
    res.status(201).json(newAcc);
  });

  // 7. Budgets REST API (Section 12 & 21)
  app.get('/api/budgets', (_req: Request, res: Response) => {
    res.json(db.get().budgets);
  });

  app.post('/api/budgets', (req: Request, res: Response) => {
    const newBudget = {
      id: req.body.id || `b-${Date.now()}`,
      category: req.body.category,
      monthlyLimit: Number(req.body.monthlyLimit),
      color: req.body.color || '#6366F1',
    };
    db.update(draft => { draft.budgets.push(newBudget); });
    res.status(201).json(newBudget);
  });

  // 8. Savings Goals REST API (Section 11 & 21)
  app.get('/api/savings-goals', (_req: Request, res: Response) => {
    res.json(db.get().goals);
  });

  app.post('/api/savings-goals', (req: Request, res: Response) => {
    const newGoal = {
      id: req.body.id || `g-${Date.now()}`,
      name: req.body.name,
      targetAmount: Number(req.body.targetAmount),
      currentAmount: Number(req.body.currentAmount || 0),
      deadline: req.body.deadline || '2026-12-31',
      category: req.body.category || 'Savings',
      color: req.body.color || '#06B6D4',
      priority: req.body.priority || 'MEDIUM',
      notes: req.body.notes || '',
    };
    db.update(draft => { draft.goals.push(newGoal); });
    res.status(201).json(newGoal);
  });

  // 9. Specs Synchronized Source Code API (Section 17.B)
  app.get('/api/specs/files', (_req: Request, res: Response) => {
    res.json(SOURCE_CODE_CATALOGUE);
  });

  // 10. Demo Reset & Controls (Section 18)
  app.post('/api/demo/reset', (_req: Request, res: Response) => {
    db.reset();
    res.json({ success: true, message: 'RupeeWise reset to standard demo dataset.' });
  });

  app.post('/api/demo/clear', (_req: Request, res: Response) => {
    db.clear();
    res.json({ success: true, message: 'All demo records cleared.' });
  });

  // 11. Vite Integration (middleware in dev / static in prod)
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RupeeWise REST Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
