import { analyzeSpending, categoryOf, currentBalance, getBudgets, getTransactions } from '../lib/storage'
import type { SpendingHint } from '../lib/types'

export default function DashboardScreen() {
  const transactions = getTransactions()
  const budgets = getBudgets()
  const balance = currentBalance()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyTx = transactions.filter((t) => new Date(t.date) >= monthStart)
  const monthlyIncome = monthlyTx.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const monthlyExpense = monthlyTx.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0
  const dayOfMonth = now.getDate()
  const dailyAvg = dayOfMonth > 0 ? monthlyExpense / dayOfMonth : 0

  const hints: SpendingHint[] = analyzeSpending(transactions, budgets, balance, monthlyIncome)
  const recent = [...transactions].reverse().slice(0, 5)

  return (
    <section className="dashboard">
      <div className="balance-card">
        <span className="muted">Current balance</span>
        <h2 className={balance < 0 ? 'negative' : ''}>{balance.toFixed(2)}</h2>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <span className="muted">Income (month)</span>
          <strong className="income">+{monthlyIncome.toFixed(2)}</strong>
        </div>
        <div className="stat">
          <span className="muted">Expenses (month)</span>
          <strong className="expense">-{monthlyExpense.toFixed(2)}</strong>
        </div>
        <div className="stat">
          <span className="muted">Savings rate</span>
          <strong>{savingsRate.toFixed(1)}%</strong>
        </div>
        <div className="stat">
          <span className="muted">Daily avg spending</span>
          <strong>{dailyAvg.toFixed(2)}</strong>
        </div>
      </div>

      <div className="card">
        <h3>💡 Smart insights</h3>
        {hints.length === 0 && <p className="muted">No insights yet — add transactions and budgets.</p>}
        <ul className="hint-list">
          {hints.map((h, i) => (
            <li key={i} className={`hint hint-${h.priority.toLowerCase()}`}>
              <strong>{h.message}</strong>
              <p className="muted">{h.suggestion}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Recent transactions</h3>
        {recent.length === 0 && <p className="muted">No transactions yet.</p>}
        <ul className="tx-list">
          {recent.map((t) => {
            const cat = categoryOf(t.categoryId)
            return (
              <li key={t.id}>
                <span>{cat?.icon} {cat?.name ?? 'Unknown'}</span>
                <span>{t.description}</span>
                <strong className={t.type === 'INCOME' ? 'income' : 'expense'}>
                  {t.type === 'INCOME' ? '+' : '-'}{t.amount.toFixed(2)}
                </strong>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
