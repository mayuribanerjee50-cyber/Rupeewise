import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEMO_ACCOUNTS,
  DEMO_BUDGETS,
  DEMO_GOALS,
  DEMO_RECURRING,
  DEMO_TRANSACTIONS,
  DEMO_USER_PROFILE,
} from '../src/data/mockData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, 'db.json');

export interface DatabaseSchema {
  profile: typeof DEMO_USER_PROFILE;
  accounts: typeof DEMO_ACCOUNTS;
  transactions: typeof DEMO_TRANSACTIONS;
  budgets: typeof DEMO_BUDGETS;
  goals: typeof DEMO_GOALS;
  recurring: typeof DEMO_RECURRING;
  metadata: {
    systemName: string;
    version: string;
    lastUpdated: string;
  };
}

const getInitialData = (): DatabaseSchema => ({
  profile: { ...DEMO_USER_PROFILE },
  accounts: [...DEMO_ACCOUNTS],
  transactions: [...DEMO_TRANSACTIONS],
  budgets: [...DEMO_BUDGETS],
  goals: [...DEMO_GOALS],
  recurring: [...DEMO_RECURRING],
  metadata: {
    systemName: 'RupeeWise — Personal Finance & Management System API Engine',
    version: '1.0.0-PROD',
    lastUpdated: new Date().toISOString(),
  },
});

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.accounts) && parsed.accounts.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing db.json, writing defaults.', e);
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  private save(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db.json:', e);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public update(updater: (draft: DatabaseSchema) => void) {
    updater(this.data);
    this.data.metadata.lastUpdated = new Date().toISOString();
    this.save(this.data);
  }

  public reset() {
    this.data = getInitialData();
    this.save(this.data);
  }

  public clear() {
    this.data.accounts = [];
    this.data.transactions = [];
    this.data.budgets = [];
    this.data.goals = [];
    this.data.recurring = [];
    this.save(this.data);
  }
}

export const db = new Database();
