import api from '@/api/axios'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { RegisterForm, type RegisterFormValues } from '@/components/organisms/RegisterForm'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (data: RegisterFormValues) => {
    setLoading(true)
    try {
      // confirmPassword hanya untuk validasi frontend, tidak dikirim ke BE
      const payload = {
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password,
      }

      await api.post('/auth/register', payload)

      // Tampilkan pesan sukses sebentar, lalu redirect ke login
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined
      toast.error(message || 'Pendaftaran gagal. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout
        title="Akun Berhasil Dibuat!"
        subtitle="Anda akan diarahkan ke halaman masuk..."
        showHomeLink
        footer={
          <span>
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Masuk sekarang →
            </Link>
          </span>
        }
      >
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Akun Anda berhasil dibuat. Silakan masuk menggunakan email dan kata sandi yang sudah Anda daftarkan.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Buat Akun Baru"
      subtitle="Daftarkan diri Anda untuk mulai menggunakan layanan."
      showHomeLink
      footer={
        <span>
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Masuk di sini
          </Link>
        </span>
      }
    >
      <RegisterForm onSubmit={handleRegister} isLoading={loading} />
    </AuthLayout>
  )
}
