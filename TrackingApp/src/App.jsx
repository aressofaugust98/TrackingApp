import { useState } from 'react'
import './App.css'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'

function App() {
  const [view, setView] = useState('login') // 'login' | 'register' | 'app'

  const handleSignedIn = () => setView('app')
  const handleRegistered = () => setView('app')

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

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  )
}

export default App
