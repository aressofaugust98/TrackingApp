import { useState } from 'react'
import './App.css'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import TransactionsPage from './pages/TransactionsPage'

function App() {
  const [view, setView] = useState('login') // 'login' | 'register' | 'app'
  const [appSection, setAppSection] = useState('dashboard')

  const handleSignedIn = () => {
    setAppSection('dashboard')
    setView('app')
  }

  const handleRegistered = () => {
    setAppSection('dashboard')
    setView('app')
  }

  if (view === 'login') {
    return (
      <LoginPage
        onSignIn={handleSignedIn}
        onRegister={() => setView('register')}
        onForgot={() => alert('Tính năng quên mật khẩu sẽ được bổ sung sau.')}
      />
    )
  }

  if (view === 'register') {
    return (
      <RegisterPage
        onRegister={handleRegistered}
        onLogin={() => setView('login')}
        onForgot={() => alert('Tính năng quên mật khẩu sẽ được bổ sung sau.')}
      />
    )
  }

  const renderSection = () => {
    switch (appSection) {
      case 'transactions':
        return <TransactionsPage />
      case 'dashboard':
      default:
        return <Dashboard />
    }
  }

  return (
    <AppLayout activeLink={appSection} onNavigate={setAppSection}>
      {renderSection()}
    </AppLayout>
  )
}

export default App
