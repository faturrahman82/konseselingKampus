import api from '@/api/axios'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Loader2, ArrowLeft, CheckCircle2, Send } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/atoms/Button'
import { cn } from '@/lib/utils'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Email wajib diisi.'); return }
    setError('')
    setLoading(true)

    try {
      // Tunggu hingga email benar-benar terkirim (blocking)
      await api.post('/auth/forgot-password', { email })

      // Baru tampilkan state sukses setelah email terkirim
      setSent(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim tautan. Pastikan email terdaftar.')
    } finally {
      setLoading(false)
    }
  }

  // ── State Sukses: tetap di halaman, tampil konfirmasi ──
  if (sent) {
    return (
      <AuthLayout
        title="Email Terkirim!"
        subtitle={`Tautan atur ulang kata sandi telah dikirim ke ${email}`}
        footer={
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Masuk
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-5 py-4">
          {/* Animated check icon */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30" />
            <div className="relative w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>

          {/* Instructions */}
          <div className="w-full space-y-3">
            {[
              { num: '1', text: `Buka Gmail ${email}` },
              { num: '2', text: 'Cari email dari UniCounsel di kotak masuk (atau folder Spam)' },
              { num: '3', text: 'Klik tombol "🔒 Atur Ulang Kata Sandi" di email tersebut' },
              { num: '4', text: 'Buat kata sandi baru dan login kembali' },
            ].map(step => (
              <div key={step.num} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {step.num}
                </span>
                <p className="text-sm text-foreground mt-0.5">{step.text}</p>
              </div>
            ))}
          </div>

          {/* Resend option */}
          <p className="text-xs text-muted-foreground text-center">
            Tidak menerima email?{' '}
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="text-primary font-semibold hover:underline"
            >
              Kirim ulang
            </button>
          </p>
        </div>
      </AuthLayout>
    )
  }

  // ── Form Awal ──
  return (
    <AuthLayout
      title="Lupa Kata Sandi"
      subtitle="Masukkan email Anda untuk menerima tautan atur ulang."
      footer={null}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Email field */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Email Terdaftar</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="email"
              placeholder="nama@universitas.ac.id"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              disabled={loading}
              className={cn(
                'w-full h-10 pl-9 pr-3 text-sm rounded-md border bg-background transition-colors',
                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                error ? 'border-destructive' : 'border-input',
                loading && 'opacity-60 cursor-not-allowed'
              )}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        {/* Loading hint */}
        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
            <Send className="h-4 w-4 text-blue-500 shrink-0 animate-bounce" />
            <p className="text-xs text-blue-700">Sedang mengirim email, mohon tunggu sebentar...</p>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" />Mengirim Email...</>
            : 'Kirim Tautan Atur Ulang'
          }
        </Button>

        {/* Back to login */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Masuk
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
