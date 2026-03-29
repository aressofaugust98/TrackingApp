import { useState } from 'react'
import './App.css'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import TransactionsPage from './pages/TransactionsPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('accessToken')
  )
  const [appSection, setAppSection] = useState('dashboard')
  const [wallets, setWallets] = useState([
    { id: '1', name: 'Tiền mặt', balance: 5000000 },
    { id: '2', name: 'Thẻ VCB', balance: 12000000 },
  ])

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
        return <TransactionsPage wallets={wallets} />
      case 'dashboard':
      default:
        return <Dashboard wallets={wallets} />
    }
  }

  return (
    <AppLayout
      activeLink={appSection}
      onNavigate={setAppSection}
      wallets={wallets}
      handleAddWallet={handleAddWallet}
      onLogoutSuccess={() => setIsAuthenticated(false)}
    >
      {renderSection()}
    </AppLayout>
  )
}

export default App
