import { useEffect, useState } from 'react'
import './App.css'
import AppLayout from './components/AppLayout'
import WalletManager from './components/WalletManager'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import TransactionsPage from './pages/TransactionsPage'
import ReportsPage from './pages/ReportsPage'
import OnboardingPage from './pages/OnboardingPage'
import { getTransactions } from './services/transactionService'
import { getAllWallets } from './services/walletService'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('accessToken')
  )
  const [authPage, setAuthPage] = useState('login')
  const [appSection, setAppSection] = useState('dashboard')
  const [wallets, setWallets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [isLoadingWallets, setIsLoadingWallets] = useState(true)

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const fetchWallets = async () => {
    try {
      setIsLoadingWallets(true)
      const data = await getAllWallets()
      setWallets(data)
    } catch (error) {
      console.error('Failed to fetch wallets:', error)
      if ((error?.message || '').toLowerCase().includes('unauthorized')) {
        setIsAuthenticated(false)
      }
    } finally {
      setIsLoadingWallets(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const formattedStart = formatDate(firstDay);
      const formattedEnd = formatDate(lastDay);

      const data = await getTransactions(formattedStart, formattedEnd);

        setTransactions(Array.isArray(data) ? data : [])
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

  useEffect(() => {
    if (isAuthenticated && !isLoadingWallets) {
      if (wallets.length === 0 && appSection !== 'onboarding') {
        setAppSection('onboarding')
      } else if (wallets.length > 0 && appSection === 'onboarding') {
        setAppSection('dashboard')
      }
    }
  }, [isAuthenticated, isLoadingWallets, wallets.length, appSection])

  const handleLoginSuccess = () => {
    setAppSection('dashboard')
    setIsAuthenticated(true)
  }

  const handleRegisterSuccess = () => {
    setAuthPage('login')
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

  const handleNavigate = (section) => {
    setAppSection(section)

    if (section === 'wallets') {
      fetchWallets()
    }
  }

  if (!isAuthenticated) {
    if (authPage === 'register') {
      return (
        <RegisterPage
          onRegister={handleRegisterSuccess}
          onLogin={() => setAuthPage('login')}
          onForgot={() => alert('Tính năng quên mật khẩu sẽ được bổ sung sau.')}
        />
      )
    }

    return (
      <LoginPage
        onLoginSuccess={() => setIsAuthenticated(true)}
        onSignIn={handleLoginSuccess}
        onRegister={() => setAuthPage('register')}
        onForgot={() => alert('Tính năng quên mật khẩu sẽ được bổ sung sau.')}
      />
    )
  }

  const renderSection = () => {
    if (isLoadingWallets) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )
    }

    switch (appSection) {
      case 'onboarding':
        return <OnboardingPage onComplete={fetchWallets} />
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
            transactions={transactions}
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
            transactions={transactions}
            onRefreshTransactions={fetchTransactions}
            onRefreshWallets={fetchWallets}
          />
        )
    }
  }

  return (
    <AppLayout
      activeLink={appSection}
      onNavigate={handleNavigate}
      onLogoutSuccess={() => setIsAuthenticated(false)}
      onRefreshTransactions={fetchTransactions}
    >
      {renderSection()}
    </AppLayout>
  )
}

export default App
