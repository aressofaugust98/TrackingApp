import { useState } from 'react'
import './App.css'
import AppLayout from './components/AppLayout'
import WalletManager from './components/WalletManager'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import TransactionsPage from './pages/TransactionsPage'
import ReportsPage from './pages/ReportsPage'
import { SAMPLE_TRANSACTIONS } from './constants/sampleTransactions'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('accessToken')
  )
  const [appSection, setAppSection] = useState('dashboard')
  const [wallets, setWallets] = useState([
    { id: '1', name: 'Tiền mặt', balance: 5000000 },
    { id: '2', name: 'Thẻ VCB', balance: 12000000 },
  ])
  const [transactions, setTransactions] = useState(SAMPLE_TRANSACTIONS)

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
        return <WalletManager wallets={wallets} onAddWallet={handleAddWallet} />
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
            <p className="text-gray-600 mt-2">Trang cài đặt sẽ được cập nhật trong phiên bản tiếp theo.</p>
          </div>
        )
      case 'dashboard':
      default:
        return <Dashboard wallets={wallets} />
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
