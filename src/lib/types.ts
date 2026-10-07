export type TransactionType = 'INCOME' | 'EXPENSE'
export type BudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface Transaction {
  id: number
  amount: number
  type: TransactionType
  categoryId: number
  description: string
  date: string // ISO
}

export interface Budget {
  id: number
  categoryId: number
  amount: number
  period: BudgetPeriod
  alertThreshold: number
}

export interface SavingsGoal {
  id: number
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string | null
  icon: string
  color: string
}

export interface Category {
  id: number
  name: string
  icon: string
  color: string
  type: TransactionType
}

// Ported from PersonalFinance DefaultCategories
export const CATEGORIES: Category[] = [
  { id: 1, name: 'Food & Dining', icon: '🍔', color: '#FF6B6B', type: 'EXPENSE' },
  { id: 2, name: 'Transportation', icon: '🚗', color: '#4ECDC4', type: 'EXPENSE' },
  { id: 3, name: 'Shopping', icon: '🛍️', color: '#FFE66D', type: 'EXPENSE' },
  { id: 4, name: 'Entertainment', icon: '🎬', color: '#95E1D3', type: 'EXPENSE' },
  { id: 5, name: 'Bills & Utilities', icon: '💡', color: '#F38181', type: 'EXPENSE' },
  { id: 6, name: 'Healthcare', icon: '🏥', color: '#AA96DA', type: 'EXPENSE' },
  { id: 7, name: 'Education', icon: '📚', color: '#FCBAD3', type: 'EXPENSE' },
  { id: 8, name: 'Others', icon: '📦', color: '#A8DADC', type: 'EXPENSE' },
  { id: 9, name: 'Salary', icon: '💰', color: '#06D6A0', type: 'INCOME' },
  { id: 10, name: 'Business', icon: '💼', color: '#118AB2', type: 'INCOME' },
  { id: 11, name: 'Investments', icon: '📈', color: '#073B4C', type: 'INCOME' },
  { id: 12, name: 'Others', icon: '💵', color: '#81B29A', type: 'INCOME' },
]

export interface SpendingHint {
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  message: string
  suggestion: string
}

export interface ExtractedBillData {
  totalAmount: number | null
  date: string | null
  merchantName: string | null
  items: string[]
  rawText: string
}
