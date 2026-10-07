import { useState } from 'react'
import { addBudget, categoryOf, deleteBudget, getBudgets, getTransactions } from '../lib/storage'
import { CATEGORIES } from '../lib/types'
import type { BudgetPeriod } from '../lib/types'

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState(getBudgets())
  const [categoryId, setCategoryId] = useState(1)
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState<BudgetPeriod>('MONTHLY')

  function add() {
    const value = Number(amount)
    if (!value || value <= 0) return
    addBudget({ categoryId, amount: value, period, alertThreshold: 0.8 })
    setBudgets(getBudgets())
    setAmount('')
  }

  function spentFor(budgetId: number, catId: number): { spent: number; pct: number } {
    const start = periodStart(getBudgets().find((b) => b.id === budgetId)!)
    const spent = getTransactions()
      .filter((t) => t.categoryId === catId && t.type === 'EXPENSE' && new Date(t.date) >= start)
      .reduce((s, t) => s + t.amount, 0)
    const budget = getBudgets().find((b) => b.id === budgetId)!
    return { spent, pct: budget.amount > 0 ? (spent / budget.amount) * 100 : 0 }
  }

  return (
    <section className="card">
      <h2>Budgets</h2>
      <div className="add-form">
        <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
          {CATEGORIES.filter((c) => c.type === 'EXPENSE').map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <select value={period} onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}>
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>
        <button className="primary" onClick={add}>Add budget</button>
      </div>

      <ul className="budget-list">
        {budgets.map((b) => {
          const cat = categoryOf(b.categoryId)
          const { spent, pct } = spentFor(b.id, b.categoryId)
          const over = pct >= 100
          const warn = pct >= b.alertThreshold * 100
          return (
            <li key={b.id}>
              <div className="budget-row">
                <strong>{cat?.icon} {cat?.name}</strong>
                <span className="muted">{b.period.toLowerCase()} · {spent.toFixed(2)} / {b.amount.toFixed(2)}</span>
                <button
                  className="small danger"
                  onClick={() => {
                    deleteBudget(b.id)
                    setBudgets(getBudgets())
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="progress">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: over ? '#dc2626' : warn ? '#f59e0b' : '#16a34a',
                  }}
                />
              </div>
              <span className={`muted ${over ? 'expense' : ''}`}>{pct.toFixed(0)}% used{over ? ' — exceeded!' : warn ? ' — warning' : ''}</span>
            </li>
          )
        })}
      </ul>
      {budgets.length === 0 && <p className="muted">No budgets yet.</p>}
    </section>
  )
}

function periodStart(budget: { period: BudgetPeriod }): Date {
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
