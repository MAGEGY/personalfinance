import { useState } from 'react'
import { addTransaction, categoryOf, deleteTransaction, getTransactions } from '../lib/storage'
import { CATEGORIES } from '../lib/types'
import type { TransactionType } from '../lib/types'

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState(getTransactions())
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('EXPENSE')
  const [categoryId, setCategoryId] = useState(1)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  function add() {
    const value = Number(amount)
    if (!value || value <= 0) return
    addTransaction({ amount: value, type, categoryId, description, date: new Date(date).toISOString() })
    setTransactions(getTransactions())
    setAmount('')
    setDescription('')
  }

  return (
    <section className="card">
      <h2>Transactions</h2>
      <div className="add-form">
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
        <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
          {CATEGORIES.filter((c) => c.type === type).map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="primary" onClick={add}>Add</button>
      </div>

      <ul className="tx-list">
        {[...transactions].reverse().map((t) => {
          const cat = categoryOf(t.categoryId)
          return (
            <li key={t.id}>
              <span>{cat?.icon} {cat?.name ?? 'Unknown'}</span>
              <span className="muted">{t.description || '—'} · {new Date(t.date).toLocaleDateString()}</span>
              <strong className={t.type === 'INCOME' ? 'income' : 'expense'}>
                {t.type === 'INCOME' ? '+' : '-'}{t.amount.toFixed(2)}
              </strong>
              <button
                className="small danger"
                onClick={() => {
                  deleteTransaction(t.id)
                  setTransactions(getTransactions())
                }}
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>
      {transactions.length === 0 && <p className="muted">No transactions yet.</p>}
    </section>
  )
}
