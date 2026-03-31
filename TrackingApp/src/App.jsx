import { useEffect, useState } from 'react'
import './App.css'
import AppLayout from './components/AppLayout'
import WalletManager from './components/WalletManager'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import TransactionsPage from './pages/TransactionsPage'
import ReportsPage from './pages/ReportsPage'
import { getTransactions } from './services/transactionService'
import { getAllWallets } from './services/walletService'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('accessToken')
  )
  const [appSection, setAppSection] = useState('dashboard')
  const [wallets, setWallets] = useState([])
  const [transactions, setTransactions] = useState([])

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const fetchWallets = async () => {
    try {
      const data = await getAllWallets()
      setWallets(data)
    } catch (error) {
      console.error('Failed to fetch wallets:', error)
      if ((error?.message || '').toLowerCase().includes('unauthorized')) {
        setIsAuthenticated(false)
      }
    }
  }

  const fetchTransactions = async () => {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const data = await getTransactions(formatDate(startOfMonth), formatDate(endOfMonth))

      if (Array.isArray(data)) {
        setTransactions(data)
        return
      }

      if (Array.isArray(data?.transactions)) {
        setTransactions(data.transactions)
        return
      }

      setTransactions([])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      if ((error?.message || '').toLowerCase().includes('unauthorized')) {
        setIsAuthenticated(false)
      }
      setTransactions([])
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    fetchWallets()
    fetchTransactions()
  }, [isAuthenticated])

  const handleLoginSuccess = () => {
    setAppSection('dashboard')
    setIsAuthenticated(true)
  }

  const handleAddWallet = ({ name, initialBalance }) => {
    const newWallet = {
      id: String(Date.now()),
      name,
      balance: Number(initialBalance) || 0,
    }
    setWallets((prev) => [...prev, newWallet])
  }

  const handleTransactionsChange = (updater) => {
    setTransactions((prev) => (typeof updater === 'function' ? updater(prev) : updater))
  }

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => setIsAuthenticated(true)}
        onSignIn={handleLoginSuccess}
        onRegister={() => alert('Tính năng đăng ký sẽ được bổ sung sau.')}
        onForgot={() => alert('Tính năng quên mật khẩu sẽ được bổ sung sau.')}
      />
    )
  }

  const renderSection = () => {
    switch (appSection) {
      case 'transactions':
        return (
          <TransactionsPage
            wallets={wallets}
            transactions={transactions}
            onTransactionsChange={handleTransactionsChange}
          />
        )
      case 'reports':
        return <ReportsPage wallets={wallets} transactions={transactions} />
      case 'wallets':
        return (
          <WalletManager
            wallets={wallets}
            onAddWallet={handleAddWallet}
            onRefreshWallets={fetchWallets}
          />
        )
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
            <p className="text-gray-600 mt-2">Trang cài đặt sẽ được cập nhật trong phiên bản tiếp theo.</p>
          </div>
        )
      case 'dashboard':
      default:
        return (
          <Dashboard
            wallets={wallets}
            onRefreshTransactions={fetchTransactions}
            onRefreshWallets={fetchWallets}
          />
        )
    }
  }

  return (
    <AppLayout
      activeLink={appSection}
      onNavigate={setAppSection}
      onLogoutSuccess={() => setIsAuthenticated(false)}
    >
      {renderSection()}
    </AppLayout>
  )
}

export default App
