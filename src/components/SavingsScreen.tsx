import { useState } from 'react'
import { addGoal, contributeGoal, deleteGoal, getGoals } from '../lib/storage'

const GOAL_ICONS = ['🎯', '🏠', '🚗', '✈️', '🎓', '💍', '📱', '🏝️']
const GOAL_COLORS = ['#06D6A0', '#118AB2', '#FF6B6B', '#AA96DA', '#FFE66D']

export default function SavingsScreen() {
  const [goals, setGoals] = useState(getGoals())
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [icon, setIcon] = useState(GOAL_ICONS[0])
  const [contribute, setContribute] = useState<Record<number, string>>({})

  function add() {
    const value = Number(target)
    if (!name || !value || value <= 0) return
    addGoal({
      name,
      targetAmount: value,
      currentAmount: 0,
      targetDate: null,
      icon,
      color: GOAL_COLORS[goals.length % GOAL_COLORS.length],
    })
    setGoals(getGoals())
    setName('')
    setTarget('')
  }

  return (
    <section className="card">
      <h2>Savings goals</h2>
      <div className="add-form">
        <input placeholder="Goal name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" placeholder="Target amount" value={target} onChange={(e) => setTarget(e.target.value)} />
        <select value={icon} onChange={(e) => setIcon(e.target.value)}>
          {GOAL_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <button className="primary" onClick={add}>Add goal</button>
      </div>

      <ul className="goal-list">
        {goals.map((g) => {
          const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
          return (
            <li key={g.id}>
              <div className="budget-row">
                <strong>{g.icon} {g.name}</strong>
                <span className="muted">{g.currentAmount.toFixed(2)} / {g.targetAmount.toFixed(2)}</span>
                <button
                  className="small danger"
                  onClick={() => {
                    deleteGoal(g.id)
                    setGoals(getGoals())
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="progress">
                <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: g.color }} />
              </div>
              <div className="budget-row">
                <span className="muted">{pct.toFixed(0)}% saved{pct >= 100 ? ' — goal reached! 🎉' : ''}</span>
                <div className="actions-inline">
                  <input
                    type="number"
                    placeholder="Add amount"
                    value={contribute[g.id] ?? ''}
                    onChange={(e) => setContribute((c) => ({ ...c, [g.id]: e.target.value }))}
                    className="inline-num"
                  />
                  <button
                    className="small"
                    onClick={() => {
                      const v = Number(contribute[g.id])
                      if (v > 0) {
                        contributeGoal(g.id, v)
                        setGoals(getGoals())
                        setContribute((c) => ({ ...c, [g.id]: '' }))
                      }
                    }}
                  >
                    Contribute
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {goals.length === 0 && <p className="muted">No savings goals yet.</p>}
    </section>
  )
}
