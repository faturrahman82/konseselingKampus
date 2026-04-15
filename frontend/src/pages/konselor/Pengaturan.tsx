import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import {
  Calendar, Video, Loader2, CheckCircle2, AlertCircle,
  Clock, Link as LinkIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'

// ── Toggle ──
const Toggle = ({
  checked, onChange, disabled,
}: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
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
    type === 'success'
      ? 'bg-green-50 border border-green-200 text-green-800'
      : 'bg-red-50 border border-red-200 text-red-800'
  )}>
    {type === 'success'
      ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
      : <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
    }
    {message}
  </div>
)

// ── Section Card ──
const SectionCard = ({ icon: Icon, title, subtitle, accent, children }: {
  icon: any; title: string; subtitle: string; accent?: string; children: React.ReactNode
}) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <div className="flex items-center gap-2.5 mb-0.5">
      <Icon className={cn('h-5 w-5', accent || 'text-primary')} />
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
    <p className={cn('text-sm mb-6', accent ? `text-${accent.replace('text-', '')}` : 'text-muted-foreground')}>
      {subtitle}
    </p>
    {children}
  </div>
)

export default function KonselorPengaturan() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Booking Rules
  const [autoApprove, setAutoApprove] = useState(false)
  const [minNoticeHours, setMinNoticeHours] = useState('24')

  // Session Defaults
  const [defaultMeetingLink, setDefaultMeetingLink] = useState('')

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Load counselor preferences
  useEffect(() => {
    api.get('/counselors/me').then(res => {
      const d = res.data.data
      if (d) {
        setAutoApprove(d.autoApprove ?? false)
        setMinNoticeHours(String(d.minNoticeHours ?? 24))
        setDefaultMeetingLink(d.defaultMeetingLink ?? '')
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    const hours = parseInt(minNoticeHours)
    if (isNaN(hours) || hours < 0) {
      showToast('Minimum notice hours harus berupa angka positif.', 'error')
      return
    }
    setSaving(true)
    try {
      await api.patch('/counselors/me', {
        autoApprove,
        minNoticeHours: hours,
        defaultMeetingLink: defaultMeetingLink.trim() || null,
      })
      showToast('Preferensi berhasil disimpan!', 'success')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan preferensi.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <DashboardLayout role="counselor">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout role="counselor">
      {toast && <Toast {...toast} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pengaturan Konselor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola aturan ketersediaan dan pengaturan sesi Anda.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* ── Booking Rules ── */}
        <SectionCard
          icon={Calendar}
          title="Aturan Pemesanan"
          subtitle="Atur cara mahasiswa dapat memesan sesi bersama Anda."
        >
          <div className="space-y-4">
            {/* Auto-Approve */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20">
              <div>
                <p className="text-sm font-medium text-foreground">Setujui Pemesanan Otomatis</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Konfirmasi janji temu secara otomatis dalam slot yang tersedia.
                </p>
              </div>
              <Toggle
                checked={autoApprove}
                onChange={setAutoApprove}
                disabled={saving}
              />
            </div>

            {/* Min Notice Hours */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Minimum Notifikasi Pemesanan (Jam)
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={minNoticeHours}
                  onChange={e => setMinNoticeHours(e.target.value)}
                  placeholder="24"
                  className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Mahasiswa tidak dapat memesan slot dalam jangkauan {minNoticeHours || 24} jam ke depan.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── Session Defaults ── */}
        <SectionCard
          icon={Video}
          title="Pengaturan Sesi"
          subtitle="Pengaturan default untuk ruang konseling virtual Anda."
        >
          <div className="space-y-4">
            {/* Default Meeting Link */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Link Rapat Default</label>
              <div className="relative">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  value={defaultMeetingLink}
                  onChange={e => setDefaultMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/your-room-id"
                  className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Link ini akan otomatis diisi saat mahasiswa memilih sesi Online.
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving
                ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</>
                : 'Simpan Preferensi'
              }
            </button>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
