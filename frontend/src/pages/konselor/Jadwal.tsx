import { DashboardLayout } from '@/layouts/DashboardLayout'
import {
  ChevronLeft, ChevronRight, Clock, Video, MapPin,
  Loader2, AlertCircle, Plus, Trash2, X, Check,
  CalendarCheck, CalendarX, ExternalLink, FileText, ChevronDown,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'

// ─── Constants ───────────────────────────────────────────────
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
]

// ─── Types ────────────────────────────────────────────────────
interface Schedule {
  id: string
  availableDate: string
  startTime: string
  endTime: string
  isBooked: boolean
}

interface Appointment {
  id: string
  scheduleId: string
  appointmentDate: string
  startTime: string
  endTime: string
  counselingType: string
  meetingLink?: string
  status: string
  topicOrReason: string
  student: { fullName: string; major?: string }
}

type ConfirmAction =
  | { type: 'deleteSlot'; id: string }
  | { type: 'cancelBookedSlot'; id: string }
  | { type: 'deleteHistory'; id: string }

// ─── Helpers ─────────────────────────────────────────────────
const toDateStr = (iso: string) => {
  try { return new Date(iso).toISOString().slice(0, 10) }
  catch { return iso?.slice(0, 10) || '' }
}

const formatTime = (t: string) => {
  try { return new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) }
  catch { return t?.substring(11, 16) || t?.substring(0, 5) || '-' }
}

const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
const getFirstDay = (y: number, m: number) => new Date(y, m, 1).getDay()

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  APPROVED: { label: 'Dikonfirmasi', cls: 'bg-green-100 text-green-700' },
  PENDING:  { label: 'Menunggu',     cls: 'bg-yellow-100 text-yellow-700' },
  COMPLETED:{ label: 'Selesai',      cls: 'bg-blue-100 text-blue-700' },
  CANCELLED:{ label: 'Dibatalkan',   cls: 'bg-red-100 text-red-700' },
  REJECTED: { label: 'Ditolak',      cls: 'bg-red-100 text-red-700' },
}

const DIAGNOSIS_CATEGORIES = [
  'Kecemasan (Anxiety)',
  'Depresi (Depression)',
  'Stres Akademik',
  'Masalah Hubungan',
  'Masalah Keluarga',
  'Krisis Identitas',
  'Motivasi Belajar',
  'Adaptasi Lingkungan',
  'Lainnya',
]

// ─── Clinical Notes Modal ─────────────────────────────────────
const ClinicalNotesModal = ({
  appt,
  onClose,
  onDone,
}: {
  appt: Appointment
  onClose: () => void
  onDone: () => void
}) => {
  const [form, setForm] = useState({
    diagnosisCategory: '',
    privateNotes: '',
    actionPlan: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const handleComplete = async (saveNotes: boolean) => {
    setSaving(true); setErr('')
    try {
      // 1. Tandai sesi selesai
      await api.put(`/appointments/${appt.id}/status`, { status: 'COMPLETED' })
      // 2. Simpan catatan klinis jika ada
      if (saveNotes && form.diagnosisCategory) {
        await api.post(`/appointments/${appt.id}/notes`, {
          diagnosisCategory: form.diagnosisCategory,
          privateNotes: form.privateNotes || undefined,
          actionPlan: form.actionPlan || undefined,
        })
      }
      onDone()
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Gagal memperbarui sesi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Tandai Sesi Selesai
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{appt.student?.fullName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground">Tambahkan catatan klinis untuk sesi ini (opsional namun sangat dianjurkan).</p>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Kategori Diagnosed *</label>
            <div className="relative">
              <select
                value={form.diagnosisCategory}
                onChange={e => setForm(p => ({ ...p, diagnosisCategory: e.target.value }))}
                className="w-full h-10 pl-3 pr-8 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              >
                <option value="">-- Pilih kategori --</option>
                {DIAGNOSIS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Catatan Pribadi (tidak terlihat mahasiswa)</label>
            <textarea
              rows={3}
              placeholder="Observasi klinis, gejala yang terlihat..."
              value={form.privateNotes}
              onChange={e => setForm(p => ({ ...p, privateNotes: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Rencana Tindak Lanjut</label>
            <textarea
              rows={2}
              placeholder="Sesi lanjutan, referensi layanan, dll..."
              value={form.actionPlan}
              onChange={e => setForm(p => ({ ...p, actionPlan: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {err && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{err}</p>}
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={() => handleComplete(false)}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:bg-secondary disabled:opacity-60"
          >
            Tandai Selesai Saja
          </button>
          <button
            onClick={() => handleComplete(true)}
            disabled={saving || !form.diagnosisCategory}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</> : <><Check className="h-4 w-4" />Selesai + Catatan</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Slot Modal ───────────────────────────────────────────
const ApproveModal = ({
  appt,
  onClose,
  onApproved,
}: {
  appt: Appointment
  onClose: () => void
  onApproved: () => void
}) => {
  const isOnline = appt.counselingType === 'online'
  const [meetLink, setMeetLink] = useState(appt.meetingLink || '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const handleApprove = async () => {
    if (isOnline && !meetLink.trim()) {
      setErr('Link Google Meet wajib diisi untuk sesi online.')
      return
    }
    if (isOnline && !meetLink.startsWith('http')) {
      setErr('Masukkan URL yang valid (dimulai dengan https://).')
      return
    }
    setSaving(true); setErr('')
    try {
      await api.put(`/appointments/${appt.id}/status`, {
        status: 'APPROVED',
        meetingLink: isOnline ? meetLink.trim() : undefined,
      })
      onApproved()
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Gagal menyetujui sesi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground">Setujui Sesi</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{appt.student?.fullName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {isOnline ? (
            <>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200">
                <Video className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Sesi ini <strong>Online</strong>. Buat/salin link Google Meet dan masukkan di bawah.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Link Google Meet <span className="text-destructive">*</span></label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={meetLink}
                  onChange={e => { setMeetLink(e.target.value); setErr('') }}
                  className={cn(
                    'w-full h-10 px-3 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring',
                    err ? 'border-destructive' : 'border-input'
                  )}
                />
                <a
                  href="https://meet.google.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Buat Meet baru di Google
                </a>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
              <MapPin className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <p className="text-xs text-green-700">
                Sesi ini <strong>Offline</strong>. Informasikan lokasi/ruangan kepada mahasiswa melalui chat.
              </p>
            </div>
          )}

          {err && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{err}
            </p>
          )}
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-secondary">
            Batal
          </button>
          <button
            onClick={handleApprove}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Menyetujui...</> : <><Check className="h-4 w-4" />Setujui Sesi</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Slot Modal ───────────────────────────────────────────
const AddSlotModal = ({
  selectedDate,
  onClose,
  onSaved,
}: {
  selectedDate: string
  onClose: () => void
  onSaved: () => void
}) => {
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime]   = useState('10:00')
  const [saving, setSaving]     = useState(false)
  const [err, setErr]           = useState('')

  const handleSave = async () => {
    if (!startTime || !endTime) { setErr('Pilih jam mulai dan selesai.'); return }
    if (startTime >= endTime)   { setErr('Jam mulai harus sebelum jam selesai.'); return }
    setSaving(true); setErr('')
    try {
      await api.post('/schedules', {
        availableDate: selectedDate,
        startTime: startTime + ':00',
        endTime:   endTime + ':00',
      })
      onSaved()
    } catch (e: any) {
      setErr(e.response?.data?.message || e.response?.data?.error || 'Gagal menambah slot.')
    } finally {
      setSaving(false)
    }
  }

  const displayDate = new Date(selectedDate + 'T00:00:00')
    .toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground">Tambahkan Jadwal Konsultasi</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{displayDate}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Jam Mulai</label>
              <select
                value={startTime}
                onChange={e => { setStartTime(e.target.value); setErr('') }}
                className="w-full h-10 px-3 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Jam Selesai</label>
              <select
                value={endTime}
                onChange={e => { setEndTime(e.target.value); setErr('') }}
                className="w-full h-10 px-3 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {err && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{err}
            </p>
          )}
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-secondary">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</> : <><Check className="h-4 w-4" />Simpan Jadwal</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
const ConfirmModal = ({
  title,
  description,
  confirmLabel,
  loading,
  onClose,
  onConfirm,
}: {
  title: string
  description: string
  confirmLabel: string
  loading: boolean
  onClose: () => void
  onConfirm: () => void
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border">
      <div className="flex items-start gap-4 p-6">
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="flex gap-3 p-6 pt-0">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors disabled:opacity-60"
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Memproses...</> : confirmLabel}
        </button>
      </div>
    </div>
  </div>
)

export default function KonselorJadwal() {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selDay, setSelDay] = useState(today.getDate())

  const [schedules,    setSchedules]    = useState<Schedule[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading,      setLoading]      = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleting,     setDeleting]     = useState<string | null>(null)
  const [cancellingBookedSlot, setCancellingBookedSlot] = useState<string | null>(null)
  const [approveTarget, setApproveTarget] = useState<Appointment | null>(null)
  const [editLinkTarget, setEditLinkTarget] = useState<string | null>(null)
  const [editLinkValue, setEditLinkValue] = useState('')
  const [savingLink, setSavingLink] = useState(false)
  const [completeTarget, setCompleteTarget] = useState<Appointment | null>(null)
  const [deletingHistory, setDeletingHistory] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [sRes, aRes] = await Promise.all([
        api.get('/schedules/mine'),
        api.get('/appointments/counselor'),
      ])
      setSchedules(sRes.data.data || [])
      setAppointments(aRes.data.data || [])
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Calendar helpers
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay    = getFirstDay(year, month)

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`

  // Days that have schedules or appointments this month
  const scheduleDays = new Set(
    schedules.filter(s => {
      const d = new Date(s.availableDate)
      return d.getFullYear() === year && d.getMonth() === month
    }).map(s => new Date(s.availableDate).getDate())
  )
  const appointmentDays = new Set(
    appointments.filter(a => {
      const d = new Date(a.appointmentDate)
      return d.getFullYear() === year && d.getMonth() === month
    }).map(a => new Date(a.appointmentDate).getDate())
  )

  // Right panel data for selected date
  const daySchedules    = schedules.filter(s => toDateStr(s.availableDate) === selectedDateStr)
  const dayAppointments = appointments.filter(a => toDateStr(a.appointmentDate) === selectedDateStr)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await api.delete(`/schedules/${id}`)
      showToast('Jadwal berhasil dihapus.')
      fetchAll()
      setConfirmAction(null)
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal menghapus slot.', false)
    } finally {
      setDeleting(null)
    }
  }

  const handleStatusUpdate = async (apptId: string, status: 'REJECTED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await api.put(`/appointments/${apptId}/status`, { status })
      showToast(
        status === 'COMPLETED'
          ? 'Sesi ditandai selesai.'
          : status === 'CANCELLED'
            ? 'Sesi berhasil dibatalkan dan slot kembali tersedia.'
            : 'Sesi ditolak.'
      )
      fetchAll()
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal mengubah status.', false)
    }
  }

  const handleCancelBookedSlot = async (scheduleId: string) => {
    const appointment = appointments.find(a =>
      a.scheduleId === scheduleId && (a.status === 'PENDING' || a.status === 'APPROVED')
    )

    if (!appointment) {
      showToast('Data janji temu untuk slot ini tidak ditemukan.', false)
      return
    }

    setCancellingBookedSlot(scheduleId)
    try {
      await api.put(`/appointments/${appointment.id}/status`, { status: 'CANCELLED' })
      showToast('Sesi berhasil dibatalkan dan slot kembali tersedia.')
      fetchAll()
      setConfirmAction(null)
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal membatalkan sesi.', false)
    } finally {
      setCancellingBookedSlot(null)
    }
  }

  const handleDeleteHistory = async (apptId: string) => {
    setDeletingHistory(apptId)
    try {
      await api.delete(`/appointments/counselor-history/${apptId}`)
      showToast('Riwayat sesi berhasil dihapus.')
      fetchAll()
      setConfirmAction(null)
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal menghapus riwayat sesi.', false)
    } finally {
      setDeletingHistory(null)
    }
  }

  const handleUpdateLink = async (apptId: string) => {
    if (!editLinkValue.trim().startsWith('http')) {
      showToast('URL tidak valid. Harus dimulai dengan https://', false)
      return
    }
    setSavingLink(true)
    try {
      await api.patch(`/appointments/${apptId}/meeting-link`, { meetingLink: editLinkValue.trim() })
      showToast('Link Meet berhasil diperbarui!')
      setEditLinkTarget(null)
      setEditLinkValue('')
      fetchAll()
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Gagal update link.', false)
    } finally {
      setSavingLink(false)
    }
  }

  const confirmModalCopy = confirmAction?.type === 'deleteSlot'
    ? {
        title: 'Hapus Slot Jadwal?',
        description: 'Slot jadwal yang masih bebas akan dihapus dari daftar ketersediaan Anda.',
        confirmLabel: 'Hapus Slot',
        loading: deleting === confirmAction.id,
      }
    : confirmAction?.type === 'cancelBookedSlot'
      ? {
          title: 'Batalkan Sesi?',
          description: 'Janji temu pada slot ini akan dibatalkan dan slot akan kembali tersedia untuk mahasiswa.',
          confirmLabel: 'Batalkan Sesi',
          loading: cancellingBookedSlot === confirmAction.id,
        }
      : confirmAction?.type === 'deleteHistory'
        ? {
            title: 'Hapus Riwayat Sesi?',
            description: 'Riwayat ini akan disembunyikan dari tampilan Anda. Data utama tetap tersimpan untuk kebutuhan sistem.',
            confirmLabel: 'Hapus Riwayat',
            loading: deletingHistory === confirmAction.id,
          }
        : null

  if (loading) return (
    <DashboardLayout role="counselor">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout role="counselor">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border',
          toast.ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        )}>
          {toast.ok ? <Check className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
          {toast.msg}
        </div>
      )}

      {confirmAction && confirmModalCopy && (
        <ConfirmModal
          {...confirmModalCopy}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            if (confirmAction.type === 'deleteSlot') handleDelete(confirmAction.id)
            if (confirmAction.type === 'cancelBookedSlot') handleCancelBookedSlot(confirmAction.id)
            if (confirmAction.type === 'deleteHistory') handleDeleteHistory(confirmAction.id)
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jadwal & Ketersediaan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Atur slot ketersediaan Anda dan kelola janji temu mahasiswa.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Jadwal Baru
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary block" />Jadwal Tersedia</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" />Ada Janji Temu</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Kalender ── */}
        <div className="lg:col-span-3 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isToday    = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const isSelected = day === selDay
              const hasSchedule = scheduleDays.has(day)
              const hasAppt     = appointmentDays.has(day)

              return (
                <button
                  key={day}
                  onClick={() => setSelDay(day)}
                  className={cn(
                    'relative h-10 w-full rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center gap-0.5',
                    isSelected ? 'bg-primary text-primary-foreground' :
                    isToday    ? 'bg-accent text-primary font-bold' :
                    'hover:bg-secondary text-foreground'
                  )}
                >
                  <span>{day}</span>
                  {/* Dots */}
                  {(hasSchedule || hasAppt) && !isSelected && (
                    <div className="flex gap-0.5">
                      {hasSchedule && <span className="w-1 h-1 rounded-full bg-primary" />}
                      {hasAppt     && <span className="w-1 h-1 rounded-full bg-amber-400" />}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Panel Kanan ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tanggal header */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold text-foreground">
              {selDay} {MONTHS[month]} {year}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {daySchedules.length} slot tersedia · {dayAppointments.length} janji temu
            </p>
          </div>

          {/* ── Slot Ketersediaan ── */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                Jadwal Tersedia
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" /> Tambah
              </button>
            </div>

            {daySchedules.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarX className="h-7 w-7 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">Belum ada slot di tanggal ini.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                >
                  + Tambah slot
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {daySchedules.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground">
                        {formatTime(s.startTime)} – {formatTime(s.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.isBooked ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Di-book</span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Bebas</span>
                      )}
                      {!s.isBooked && (
                        <button
                          onClick={() => setConfirmAction({ type: 'deleteSlot', id: s.id })}
                          disabled={deleting === s.id}
                          className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          {deleting === s.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />
                          }
                        </button>
                      )}
                      {s.isBooked && (
                        <button
                          onClick={() => setConfirmAction({ type: 'cancelBookedSlot', id: s.id })}
                          disabled={cancellingBookedSlot === s.id}
                          className="px-2 py-1 rounded-md text-xs font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 flex items-center gap-1"
                          title="Batalkan sesi pada slot ini"
                        >
                          {cancellingBookedSlot === s.id
                            ? <><Loader2 className="h-3 w-3 animate-spin" />Batal...</>
                            : <><CalendarX className="h-3 w-3" />Batalkan</>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Janji Temu ── */}
          {dayAppointments.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <CalendarCheck className="h-3.5 w-3.5 text-amber-500" />
                  Janji Temu ({dayAppointments.length})
                </p>
              </div>
              <div className="divide-y divide-border">
                {dayAppointments.map(a => {
                  const s = STATUS_MAP[a.status] || STATUS_MAP.PENDING
                  return (
                    <div key={a.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="text-sm font-semibold text-foreground">
                            {formatTime(a.startTime)} – {formatTime(a.endTime)}
                          </span>
                        </div>
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', s.cls)}>{s.label}</span>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground">{a.student?.fullName || '-'}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{a.topicOrReason}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {a.counselingType === 'online'
                          ? <span className="flex items-center gap-1 text-xs text-blue-600"><Video className="h-3 w-3" />Online</span>
                          : <span className="flex items-center gap-1 text-xs text-green-600"><MapPin className="h-3 w-3" />Offline</span>
                        }
                      </div>

                      {/* Action buttons based on status */}
                      {a.status === 'PENDING' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleStatusUpdate(a.id, 'REJECTED')}
                            className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            Tolak
                          </button>
                          <button
                            onClick={() => setApproveTarget(a)}
                            className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
                          >
                            Setujui
                          </button>
                        </div>
                      )}
                      {a.status === 'APPROVED' && (
                        <div className="space-y-2 pt-1">
                          <div className="flex gap-2">
                            {a.meetingLink && a.counselingType === 'online' && (
                              <a
                                href={a.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1 transition-colors"
                              >
                                <Video className="h-3 w-3" /> Gabung
                              </a>
                            )}
                            <button
                              onClick={() => setCompleteTarget(a)}
                              className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                              Tandai Selesai
                            </button>
                          </div>

                          {/* Ganti Link Meet untuk online */}
                          {a.counselingType === 'online' && (
                            editLinkTarget === a.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  placeholder="https://meet.google.com/abc-defg-hij"
                                  value={editLinkValue}
                                  onChange={e => setEditLinkValue(e.target.value)}
                                  className="flex-1 h-8 px-3 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdateLink(a.id)}
                                  disabled={savingLink}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                                >
                                  {savingLink ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                </button>
                                <button
                                  onClick={() => { setEditLinkTarget(null); setEditLinkValue('') }}
                                  className="px-2 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:bg-secondary"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditLinkTarget(a.id); setEditLinkValue(a.meetingLink || '') }}
                                className="w-full py-1.5 rounded-lg text-xs font-medium border border-dashed border-primary/40 text-primary hover:bg-accent transition-colors flex items-center justify-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {a.meetingLink ? 'Ganti Link Meet' : '+ Tambah Link Meet'}
                              </button>
                            )
                          )}
                        </div>
                      )}
                      {['COMPLETED', 'CANCELLED', 'REJECTED'].includes(a.status) && (
                        <button
                          onClick={() => setConfirmAction({ type: 'deleteHistory', id: a.id })}
                          disabled={deletingHistory === a.id}
                          className="w-full py-1.5 rounded-lg text-xs font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                        >
                          {deletingHistory === a.id
                            ? <><Loader2 className="h-3 w-3 animate-spin" />Menghapus...</>
                            : <><Trash2 className="h-3 w-3" />Hapus Riwayat</>
                          }
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal (for online appointments) */}
      {approveTarget && (
        <ApproveModal
          appt={approveTarget}
          onClose={() => setApproveTarget(null)}
          onApproved={() => {
            setApproveTarget(null)
            showToast('Sesi berhasil disetujui!')
            fetchAll()
          }}
        />
      )}

      {/* Clinical Notes Modal */}
      {completeTarget && (
        <ClinicalNotesModal
          appt={completeTarget}
          onClose={() => setCompleteTarget(null)}
          onDone={() => {
            setCompleteTarget(null)
            showToast('Sesi selesai & catatan tersimpan!')
            fetchAll()
          }}
        />
      )}

      {/* Approve Modal */}
      {showAddModal && (
        <AddSlotModal
          selectedDate={selectedDateStr}
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false)
            showToast('Jadwal berhasil ditambahkan!')
            fetchAll()
          }}
        />
      )}
    </DashboardLayout>
  )
}
