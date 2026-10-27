/**
 * RupeeWise Full-Stack API Client
 * Connects frontend to Express REST endpoints on /api/*
 */

export interface SystemHealth {
  status: string;
  system: string;
  version: string;
  serverTime: string;
  database: string;
  entities: {
    accounts: number;
    transactions: number;
    budgets: number;
    goals: number;
    recurring: number;
    debts: number;
  };
}

export interface APIDocs {
  projectName: string;
  architecture: string;
  developerStack: {
    frontend: string[];
    backend: string[];
    persistence: string[];
  };
  algorithms: {
    name: string;
    description: string;
    complexity?: string;
    formula?: string;
  }[];
  endpoints: string[];
}

export const fetchHealth = async (): Promise<SystemHealth | null> => {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export const fetchDocs = async (): Promise<APIDocs | null> => {
  try {
    const res = await fetch('/api/docs');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export const simulateDebtPayoffAPI = async (strategy: 'avalanche' | 'snowball', extraPayment: number) => {
  try {
    const res = await fetch('/api/debts/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy, extraMonthlyPayment: extraPayment }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};
