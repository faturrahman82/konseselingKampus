import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import {
  Settings, Bell, Shield, Loader2, CheckCircle2, AlertCircle, Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'

// ── Toggle ──
const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <button
    type="button" role="switch" aria-checked={checked} disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50',
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
    'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium',
    type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
  )}>
    {type === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />}
    {message}
  </div>
)

type TabKey = 'umum' | 'notifikasi' | 'keamanan'

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'umum', label: 'Umum', icon: Settings },
  { key: 'notifikasi', label: 'Notifikasi', icon: Bell },
  { key: 'keamanan', label: 'Keamanan', icon: Shield },
]

interface SystemSettings {
  universityName: string
  supportEmail: string
  autoApproveAppointments: boolean
  emailNotifications: boolean
  counselorAlerts: boolean
  twoFactorAuth: boolean
}

export default function PengaturanSistem() {
  const [tab, setTab] = useState<TabKey>('umum')
  const [settings, setSettings] = useState<SystemSettings>({
    universityName: '',
    supportEmail: '',
    autoApproveAppointments: false,
    emailNotifications: true,
    counselorAlerts: true,
    twoFactorAuth: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    api.get('/admin/settings')
      .then(res => {
        const d = res.data.data
        if (d) setSettings({ ...settings, ...d })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/admin/settings', settings)
      showToast('Pengaturan berhasil disimpan!', 'success')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan pengaturan.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const update = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout role="admin">
      {toast && <Toast {...toast} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pengaturan Sistem</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola preferensi dan konfigurasi aplikasi global.
        </p>
      </div>

      <div className="flex gap-6 max-w-4xl">
        {/* ── Tab Sidebar ── */}
        <div className="w-44 shrink-0">
          <div className="space-y-1">
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    tab === t.key
                      ? 'bg-accent text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 space-y-4">
          {/* ─ Umum ─ */}
          {tab === 'umum' && (
            <>
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-base font-semibold text-foreground mb-1">Detail Universitas</h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Konfigurasi detail utama untuk portal aplikasi.
                </p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Nama Institusi</label>
                    <input
                      type="text"
                      value={settings.universityName}
                      onChange={e => update('universityName', e.target.value)}
                      placeholder="Contoh: Universitas Indonesia"
                      className="w-full h-11 px-4 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Email Dukungan</label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={e => update('supportEmail', e.target.value)}
                      placeholder="support@university.edu"
                      className="w-full h-11 px-4 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</> : <><Save className="h-4 w-4" />Simpan Perubahan</>}
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-base font-semibold text-foreground mb-1">Pengaturan Jadwal</h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Tentukan aturan untuk sesi konseling.
                </p>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">Setujui Sesi Otomatis</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Otomatis menyetujui permintaan jika konselor tersedia.
                    </p>
                  </div>
                  <Toggle
                    checked={settings.autoApproveAppointments}
                    onChange={v => { update('autoApproveAppointments', v); handleSave() }}
                    disabled={saving}
                  />
                </div>
              </div>
            </>
          )}

          {/* ─ Notifikasi ─ */}
          {tab === 'notifikasi' && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-base font-semibold text-foreground mb-1">Preferensi Notifikasi</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Konfigurasikan bagaimana sistem mengirim peringatan.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Notifikasi Email</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Kirim pengingat email ke mahasiswa 24 jam sebelum sesi.
                    </p>
                  </div>
                  <Toggle
                    checked={settings.emailNotifications}
                    onChange={v => update('emailNotifications', v)}
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Peringatan Konselor</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Beri tahu konselor segera saat ada permintaan jadwal baru.
                    </p>
                  </div>
                  <Toggle
                    checked={settings.counselorAlerts}
                    onChange={v => update('counselorAlerts', v)}
                    disabled={saving}
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 mt-2"
                >
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</> : <><Save className="h-4 w-4" />Simpan Preferensi</>}
                </button>
              </div>
            </div>
          )}

          {/* ─ Keamanan ─ */}
          {tab === 'keamanan' && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-base font-semibold text-foreground mb-1">Aturan Keamanan</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Kelola autentikasi dan akses.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Autentikasi Dua Faktor</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Wajibkan 2FA untuk semua akun admin.
                    </p>
                  </div>
                  <Toggle
                    checked={settings.twoFactorAuth}
                    onChange={v => update('twoFactorAuth', v)}
                    disabled={saving}
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</> : <><Save className="h-4 w-4" />Simpan Keamanan</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
