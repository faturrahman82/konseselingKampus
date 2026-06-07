import api from '@/api/axios'
import { useAuthStore } from '@/store/useAuthStore'
import { useNavigate, Link } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginForm, type LoginFormValues } from '@/components/organisms/LoginForm'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function Login() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Cek apakah user redirect ke sini karena sesi expired
  useEffect(() => {
    if (sessionStorage.getItem('session_expired') === 'true') {
      toast.error('Sesi Anda telah berakhir, silakan login kembali.')
      sessionStorage.removeItem('session_expired')
    }
  }, [])

  const handleLogin = async (data: LoginFormValues) => {
    setLoading(true)
    try {
      // Backend response: { success, message, data: { token, user } }
      const response = await api.post('/auth/login', data)
      const { token, user } = response.data.data

      // Simpan auth dengan name dari profile.fullName
      setAuth({
        ...user,
        name: user.profile?.fullName || user.username,
      }, token)

      // Redirect berdasarkan role (backend pakai lowercase)
      const role = user.role
      if (role === 'counselor') {
        navigate('/konselor/dasbor')
      } else if (role === 'admin') {
        navigate('/admin')
      } else {
        // Mahasiswa baru (NIM belum diisi) → wajib lengkapi profil dulu
        const isProfileComplete = !!user.profile?.nim
        navigate(isProfileComplete ? '/mahasiswa/dasbor' : '/lengkapi-profil')
      }

    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined
      toast.error(message || 'Login gagal. Periksa email dan password Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Selamat Datang Kembali"
      subtitle="Silakan masuk ke akun Anda untuk melanjutkan."
      showHomeLink
      footer={
        <span>
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Daftar sekarang
          </Link>
        </span>
      }
    >
      <LoginForm onSubmit={handleLogin} isLoading={loading} />
    </AuthLayout>
  )
}
