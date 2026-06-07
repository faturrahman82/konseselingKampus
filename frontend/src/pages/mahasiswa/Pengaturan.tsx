import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import {
  Lock, Eye, EyeOff, Bell, Monitor,
  Loader2, CheckCircle2, AlertCircle, Sun, Moon, Laptop,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'
import { useThemeStore } from '@/store/useThemeStore'

// ── Reusable Toggle ──
const Toggle = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50',
      checked ? 'bg-teal-500' : 'bg-gray-200'
    )}
  >
    <span className={cn(
      'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
      checked ? 'translate-x-5' : 'translate-x-0'
    )} />
  </button>
)

// ── Toast ──
const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
  <div className={cn(
    'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in',
    type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
  )}>
    {type === 'success'
      ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
      : <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
    }
    {message}
  </div>
)

// ── Section Card ──
const SectionCard = ({ icon: Icon, title, subtitle, children }: {
  icon: any; title: string; subtitle: string; children: React.ReactNode
}) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <div className="flex items-center gap-2.5 mb-1">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
    <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
    {children}
  </div>
)

const APPEARANCE_OPTIONS = [
  { value: 'light', icon: Sun, label: 'Terang' },
  { value: 'system', icon: Laptop, label: 'Sistem' },
  { value: 'dark', icon: Moon, label: 'Gelap' },
]

export default function MahasiswaPengaturan() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // ── Password State ──
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPass, setSavingPass] = useState(false)

  // ── Notification State ──
  const [emailReminders, setEmailReminders] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [savingNotif, setSavingNotif] = useState(false)

  // ── Appearance State ──
  const { theme: appearance, setTheme: setAppearance } = useThemeStore()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Load notification preferences
  useEffect(() => {
    api.get('/auth/me').then(res => {
      const p = res.data.data?.profile
      if (p) {
        setEmailReminders(p.emailReminders ?? true)
        setSmsAlerts(p.smsAlerts ?? false)
      }
    }).catch(() => {})
  }, [])

  // Save password
  const handleSavePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      showToast('Semua field password wajib diisi.', 'error'); return
    }
    if (newPass.length < 8) {
      showToast('Password baru minimal 8 karakter.', 'error'); return
    }
    if (newPass !== confirmPass) {
      showToast('Konfirmasi password tidak cocok.', 'error'); return
    }
    setSavingPass(true)
    try {
      await api.patch('/auth/change-password', {
        currentPassword: currentPass,
        newPassword: newPass,
      })
      showToast('Password berhasil diperbarui!', 'success')
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal memperbarui password.', 'error')
    } finally {
      setSavingPass(false)
    }
  }

  // Save notification preferences
  const handleSaveNotif = async () => {
    setSavingNotif(true)
    try {
      await api.patch('/students/profile', { emailReminders, smsAlerts })
      showToast('Preferensi notifikasi disimpan!', 'success')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan preferensi.', 'error')
    } finally {
      setSavingNotif(false)
    }
  }

  // Save appearance
  const handleAppearance = (value: any) => {
    setAppearance(value)
    showToast('Tampilan diperbarui.', 'success')
  }

  const passInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    show: boolean,
    onToggle: () => void,
    placeholder: string
  ) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-10 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )

  return (
    <DashboardLayout role="student">
      {toast && <Toast {...toast} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola password, notifikasi, dan preferensi tampilan Anda.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* ── Password Section ── */}
        <SectionCard icon={Lock} title="Keamanan Akun" subtitle="Perbarui password dan pengaturan keamanan akun Anda.">
          <div className="space-y-4">
            {passInput('Password Saat Ini', currentPass, setCurrentPass, showCurrent, () => setShowCurrent(v => !v), '••••••••')}

            <div className="grid grid-cols-2 gap-3">
              {passInput('Password Baru', newPass, setNewPass, showNew, () => setShowNew(v => !v), 'Min. 8 karakter')}
              {passInput('Konfirmasi Password Baru', confirmPass, setConfirmPass, showConfirm, () => setShowConfirm(v => !v), 'Ulangi password baru')}
            </div>


            <button
              onClick={handleSavePassword}
              disabled={savingPass}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {savingPass
                ? <><Loader2 className="h-4 w-4 animate-spin" />Memperbarui...</>
                : 'Perbarui Password'
              }
            </button>
          </div>
        </SectionCard>


        {/* ── Notifications Section ── */}
        <SectionCard icon={Bell} title="Notifikasi" subtitle="Pilih jenis notifikasi yang ingin Anda terima.">
          <div className="space-y-3">
            {/* Email Reminders */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Pengingat Email</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Terima pengingat sesi 24 jam sebelumnya.
                </p>
              </div>
              <Toggle
                checked={emailReminders}
                onChange={v => { setEmailReminders(v); }}
                disabled={savingNotif}
              />
            </div>

            {/* SMS Alerts */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Notifikasi SMS</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Terima pesan teks untuk pembaruan penting.
                </p>
              </div>
              <Toggle
                checked={smsAlerts}
                onChange={v => { setSmsAlerts(v); }}
                disabled={savingNotif}
              />
            </div>

            <button
              onClick={handleSaveNotif}
              disabled={savingNotif}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 mt-4"
            >
              {savingNotif
                ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</>
                : 'Simpan Preferensi'
              }
            </button>
          </div>
        </SectionCard>

        {/* ── Appearance Section ── */}
        <SectionCard icon={Monitor} title="Tampilan" subtitle="Pilih tema warna yang Anda sukai untuk tampilan aplikasi.">
          <div className="grid grid-cols-3 gap-3">
            {APPEARANCE_OPTIONS.map(opt => {
              const Icon = opt.icon
              const isSelected = appearance === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => handleAppearance(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all text-sm font-medium',
                    isSelected
                      ? 'border-primary bg-accent text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-secondary/40'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {opt.label}
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
