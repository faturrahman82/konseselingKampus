import axios from 'axios'
import { useAuthStore } from '@/store/useAuthStore'
import { useNavigate, Link } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginForm } from '@/components/organisms/LoginForm'
import { useState } from 'react'

export default function Login() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (data: any) => {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', data)
      setAuth(response.data.user, response.data.token)
      navigate('/')
    } catch (error: any) {
      alert(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Login to your account">
      <LoginForm onSubmit={handleLogin} isLoading={loading} />
      <p className="text-center text-sm text-muted-foreground mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:underline">
          Register
        </Link>
      </p>
    </AuthLayout>
  )
}
