import { useState } from 'react'
import DashboardScreen from './components/DashboardScreen'
import TransactionsScreen from './components/TransactionsScreen'
import BudgetsScreen from './components/BudgetsScreen'
import SavingsScreen from './components/SavingsScreen'
import ScannerScreen from './components/ScannerScreen'
import FloatingHelp from './components/FloatingHelp'
import type { HelpHowTo } from './components/FloatingHelp'

type Tab = 'dashboard' | 'transactions' | 'budgets' | 'savings' | 'scan'

const HELP_HOWTOS: HelpHowTo[] = [
  { title: 'Add a transaction', body: 'Open the Transactions tab, fill in the amount, pick Expense or Income, choose a category, add a description and date, then tap Add. The dashboard balance updates immediately.' },
  { title: 'Scan a bill', body: 'Open the "Scan bill" tab, photograph the bill (or upload a photo) and OCR extracts the total amount, date and merchant name. Check the values, pick a category and tap "Save as expense" — the transaction is created for you.' },
  { title: 'Set a budget', body: 'In the Budgets tab pick a category, enter the amount and choose the period (daily, weekly, monthly, yearly). The progress bar turns amber at 80% (the alert threshold) and red when exceeded. Dashboard insights warn you too.' },
  { title: 'Create a savings goal', body: 'In the Savings tab tap a name, target amount and icon, then Add. Use the "Contribute" field to add money to the goal — the progress bar fills and celebrates at 100%.' },
  { title: 'Smart insights', body: 'The Dashboard analyzes your data: budget overruns, spending increases vs last month, categories dominating your spending, balance health, and your savings rate. High priority items appear first.' },
  { title: 'Where is my data?', body: 'Everything is stored locally in your browser (localStorage) — nothing is uploaded anywhere. Clearing browser data removes it, so export nothing you cannot afford to lose.' },
]

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
      <FloatingHelp
        color="#0ea5e9"
        functions={[
          { label: 'Dashboard', description: 'Balance, monthly overview, savings rate and smart insights', action: () => setTab('dashboard') },
          { label: 'Transactions', description: 'Add and manage income and expense records', action: () => setTab('transactions') },
          { label: 'Budgets', description: 'Category budgets with progress bars and alerts', action: () => setTab('budgets') },
          { label: 'Savings goals', description: 'Create goals and contribute towards them', action: () => setTab('savings') },
          { label: 'Scan a bill', description: 'OCR a bill photo to create an expense automatically', action: () => setTab('scan') },
        ]}
        howtos={HELP_HOWTOS}
      />
    </div>
  )
}
