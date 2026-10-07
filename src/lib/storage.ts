import { CATEGORIES } from './types'
import type { Budget, Category, SavingsGoal, SpendingHint, Transaction } from './types'

const KEYS = {
  transactions: 'pf_transactions',
  budgets: 'pf_budgets',
  goals: 'pf_goals',
}

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

function write<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getTransactions = () => read<Transaction>(KEYS.transactions)
export const getBudgets = () => read<Budget>(KEYS.budgets)
export const getGoals = () => read<SavingsGoal>(KEYS.goals)

export function nextId<T extends { id: number }>(items: T[]): number {
  return items.reduce((max, x) => Math.max(max, x.id), 0) + 1
}

export function addTransaction(t: Omit<Transaction, 'id'>): void {
  const all = getTransactions()
  write(KEYS.transactions, [...all, { ...t, id: nextId(all) }])
}

export function deleteTransaction(id: number): void {
  write(KEYS.transactions, getTransactions().filter((t) => t.id !== id))
}

export function addBudget(b: Omit<Budget, 'id'>): void {
  const all = getBudgets()
  write(KEYS.budgets, [...all, { ...b, id: nextId(all) }])
}

export function deleteBudget(id: number): void {
  write(KEYS.budgets, getBudgets().filter((b) => b.id !== id))
}

export function addGoal(g: Omit<SavingsGoal, 'id'>): void {
  const all = getGoals()
  write(KEYS.goals, [...all, { ...g, id: nextId(all) }])
}

export function contributeGoal(id: number, amount: number): void {
  const goals = getGoals()
  const goal = goals.find((g) => g.id === id)
  if (goal) {
    goal.currentAmount += amount
    write(KEYS.goals, goals)
  }
}

export function deleteGoal(id: number): void {
  write(KEYS.goals, getGoals().filter((g) => g.id !== id))
}

export function categoryOf(id: number): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

export function currentBalance(): number {
  return getTransactions().reduce(
    (sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount),
    0,
  )
}

// Ported from PersonalFinance SpendingAnalyzer.kt
export function analyzeSpending(
  transactions: Transaction[],
  budgets: Budget[],
  balance: number,
  monthlyIncome: number,
): SpendingHint[] {
  const hints: SpendingHint[] = []
  const now = new Date()

  // Budget overruns
  for (const budget of budgets) {
    const start = periodStart(budget)
    const spent = transactions
      .filter((t) => t.categoryId === budget.categoryId && t.type === 'EXPENSE' && new Date(t.date) >= start)
      .reduce((s, t) => s + t.amount, 0)
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

    if (percentage >= 100) {
      hints.push({
        priority: 'HIGH',
        message: `You've exceeded your budget by ${(spent - budget.amount).toFixed(2)}`,
        suggestion: 'Consider reducing spending in this category or adjusting your budget',
      })
    } else if (percentage >= budget.alertThreshold * 100) {
      hints.push({
        priority: 'MEDIUM',
        message: `You've used ${percentage.toFixed(1)}% of your budget`,
        suggestion: `You have ${(budget.amount - spent).toFixed(2)} remaining`,
      })
    }
  }

  // Spending trends (this month vs last month)
  const monthExpenses = (d: Date) =>
    transactions
      .filter((t) => t.type === 'EXPENSE' && new Date(t.date).getMonth() === d.getMonth() && new Date(t.date).getFullYear() === d.getFullYear())
      .reduce((s, t) => s + t.amount, 0)

  const currentMonth = monthExpenses(now)
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonth = monthExpenses(lastMonthDate)

  if (lastMonth > 0) {
    const increase = ((currentMonth - lastMonth) / lastMonth) * 100
    if (increase > 20) {
      hints.push({
        priority: 'MEDIUM',
        message: `Your spending increased by ${increase.toFixed(1)}% this month`,
        suggestion: 'Review your recent expenses and identify areas to cut back',
      })
    }
  }

  // Category dominance
  const byCategory = new Map<number, number>()
  for (const t of transactions.filter((t) => t.type === 'EXPENSE')) {
    byCategory.set(t.categoryId, (byCategory.get(t.categoryId) ?? 0) + t.amount)
  }
  const totalExpense = [...byCategory.values()].reduce((s, v) => s + v, 0)
  for (const amount of byCategory.values()) {
    const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0
    if (percentage > 40) {
      hints.push({
        priority: 'LOW',
        message: `One category accounts for ${percentage.toFixed(1)}% of your spending`,
        suggestion: 'Consider diversifying your expenses or setting a budget for this category',
      })
    }
  }

  // Balance health
  if (monthlyIncome > 0) {
    if (balance < monthlyIncome * 0.5) {
      hints.push({
        priority: 'HIGH',
        message: 'Your balance is critically low',
        suggestion: 'Focus on essential expenses and consider ways to increase income',
      })
    } else if (balance < monthlyIncome) {
      hints.push({
        priority: 'MEDIUM',
        message: "Your balance is below one month's income",
        suggestion: 'Build up your emergency fund to at least 3 months of expenses',
      })
    }
  }

  // Savings rate
  if (monthlyIncome > 0) {
    const savingsRate = ((monthlyIncome - currentMonth) / monthlyIncome) * 100
    if (savingsRate < 10) {
      hints.push({
        priority: 'MEDIUM',
        message: `You're saving only ${savingsRate.toFixed(1)}% of your income`,
        suggestion: 'Aim to save at least 20% of your income for better financial health',
      })
    } else if (savingsRate >= 20) {
      hints.push({
        priority: 'LOW',
        message: `Great job! You're saving ${savingsRate.toFixed(1)}% of your income`,
        suggestion: 'Keep up the good work and consider investing your savings',
      })
    }
  }

  const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const
  return hints.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
}

function periodStart(budget: Budget): Date {
  const now = new Date()
  switch (budget.period) {
    case 'DAILY':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'WEEKLY': {
      const d = new Date(now)
      d.setDate(d.getDate() - d.getDay())
      return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    }
    case 'YEARLY':
      return new Date(now.getFullYear(), 0, 1)
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1)
  }
}
