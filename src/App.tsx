import { useState } from 'react'
import DashboardScreen from './components/DashboardScreen'
import TransactionsScreen from './components/TransactionsScreen'
import BudgetsScreen from './components/BudgetsScreen'
import SavingsScreen from './components/SavingsScreen'
import ScannerScreen from './components/ScannerScreen'

type Tab = 'dashboard' | 'transactions' | 'budgets' | 'savings' | 'scan'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <div className="app">
      <header className="header">
        <h1>💰 Personal Finance</h1>
        <p className="subtitle">Track expenses, budgets, savings goals, and scan bills</p>
      </header>
      <nav className="tabs">
        <button className={tab === 'dashboard' ? 'tab active' : 'tab'} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={tab === 'transactions' ? 'tab active' : 'tab'} onClick={() => setTab('transactions')}>Transactions</button>
        <button className={tab === 'budgets' ? 'tab active' : 'tab'} onClick={() => setTab('budgets')}>Budgets</button>
        <button className={tab === 'savings' ? 'tab active' : 'tab'} onClick={() => setTab('savings')}>Savings</button>
        <button className={tab === 'scan' ? 'tab active' : 'tab'} onClick={() => setTab('scan')}>Scan bill</button>
      </nav>
      <main>
        {tab === 'dashboard' && <DashboardScreen />}
        {tab === 'transactions' && <TransactionsScreen />}
        {tab === 'budgets' && <BudgetsScreen />}
        {tab === 'savings' && <SavingsScreen />}
        {tab === 'scan' && <ScannerScreen />}
      </main>
      <footer className="footer">All data is stored locally in your browser.</footer>
    </div>
  )
}
