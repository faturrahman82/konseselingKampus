import api from '@/api/axios'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/Button'
import { UniCounselIcon } from '@/layouts/AuthLayout'

// ── Toast Notification ──
const Toast = ({ message }: { message: string }) => (
  <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium bg-green-50 border border-green-200 text-green-800 animate-fade-in">
    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
    {message}
  </div>
)

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)

  // Show toast if navigated from ForgotPassword
  useEffect(() => {
    if (location.state?.showToast) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
    }
  }, [location.state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newPassword) { setError('Kata sandi baru wajib diisi.'); return }
    if (newPassword.length < 8) { setError('Kata sandi minimal 8 karakter.'); return }
    if (newPassword !== confirmPassword) { setError('Konfirmasi kata sandi tidak cocok.'); return }
    if (!token) { setError('Token tidak valid atau tidak ditemukan.'); return }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword })
      // Sukses → redirect ke login
      navigate('/login', { state: { resetSuccess: true } })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Token tidak valid atau sudah kadaluarsa.')
    } finally {
      setLoading(false)
    }
  }

  const passInput = (
    label: string,
    placeholder: string,
    value: string,
    onChange: (v: string) => void,
    show: boolean,
    onToggle: () => void
  ) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => { onChange(e.target.value); setError('') }}
          className={cn(
            'w-full h-10 pl-9 pr-9 text-sm rounded-md border bg-background transition-colors',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
            error ? 'border-destructive' : 'border-input'
          )}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {showToast && (
        <Toast message="Tautan atur ulang kata sandi telah dikirim ke email Anda." />
      )}

      <div className="min-h-screen bg-[#f0f2f7] flex flex-col items-center justify-center p-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <UniCounselIcon size={60} />
          <h1 className="text-xl font-bold text-foreground mt-3">UniCounsel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistem Pemesanan Konseling dan Konsultasi Universitas
          </p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg border border-border p-8">
          {/* Icon + Title */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-accent/60 flex items-center justify-center mb-4">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-center text-foreground">Atur Ulang Kata Sandi</h2>
            <p className="text-sm text-center text-muted-foreground mt-1.5">
              Masukkan kata sandi baru Anda untuk mengamankan akun.
            </p>
          </div>

          {/* Invalid token warning */}
          {!token && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive text-center">
                Link tidak valid. Silakan minta ulang tautan atur ulang dari halaman lupa kata sandi.
              </p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {passInput(
              'Kata Sandi Baru',
              'Minimal 8 karakter',
              newPassword,
              setNewPassword,
              showNew,
              () => setShowNew(v => !v)
            )}
            {passInput(
              'Konfirmasi Kata Sandi Baru',
              'Ketik ulang kata sandi',
              confirmPassword,
              setConfirmPassword,
              showConfirm,
              () => setShowConfirm(v => !v)
            )}

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading || !token}
              className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</>
                : <>Simpan Kata Sandi <ArrowRight className="h-4 w-4" /></>
              }
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground mt-6 text-center">
          © 2026 Pusat Kesejahteraan Universitas. Hak Cipta Dilindungi.
        </p>
      </div>
    </>
  )
}
