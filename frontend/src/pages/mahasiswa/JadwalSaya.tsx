import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import {
  Calendar, Clock, Video, MapPin, Search, Loader2,
  AlertCircle, X, XCircle, Star, Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'
import { toast } from 'sonner'

interface Appointment {
  id: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  counselingType: string
  topicOrReason: string
  meetingLink?: string
  counselor: {
    fullName: string
    specialization: string
    avatarUrl?: string
  }
}

type ConfirmAction =
  | { type: 'cancelAppointment'; id: string }
  | { type: 'deleteHistory'; id: string }

// ── Helpers ──
const AVATAR_COLORS = ['bg-teal-500', 'bg-violet-500', 'bg-blue-500', 'bg-rose-500', 'bg-amber-500']
const getColor = (name: string) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]
const getInitials = (name: string) => name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'DR'

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return d }
}

const formatTime = (t: string) => {
  try { return new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) }
  catch { return t?.substring(11, 16) || '-' }
}

// ── Review Modal ──
const ReviewModal = ({
  appointmentId,
  counselorName,
  onClose,
  onSubmitted,
}: {
  appointmentId: string
  counselorName: string
  onClose: () => void
  onSubmitted: () => void
}) => {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) { setErr('Pilih bintang terlebih dahulu.'); return }
    setLoading(true); setErr('')
    try {
      await api.post(`/reviews/${appointmentId}`, { rating, comment })
      onSubmitted()
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Gagal mengirim ulasan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground">Beri Ulasan Sesi</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{counselorName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Stars */}
          <div className="flex justify-center gap-2">
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(s)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={cn('h-8 w-8', (hover || rating) >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-200')}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {rating === 0 ? 'Pilih bintang' : ['','Sangat Buruk','Buruk','Cukup','Baik','Sangat Baik'][rating]}
          </p>
          <textarea
            rows={3}
            placeholder="Tambahkan komentar (opsional)..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-secondary">Batal</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Mengirim...</> : 'Kirim Ulasan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Status Badge ──
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; class: string; dot?: string }> = {
    APPROVED: { label: 'Dikonfirmasi', class: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    PENDING: { label: 'Menunggu Persetujuan', class: 'border border-gray-400 text-gray-700 bg-transparent' },
    COMPLETED: { label: 'Selesai', class: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    CANCELLED: { label: 'Dibatalkan', class: 'bg-red-100 text-red-700' },
    REJECTED: { label: 'Ditolak', class: 'bg-red-100 text-red-700' },
  }
  const c = map[status] || map.PENDING
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full', c.class)}>
      {c.dot && <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />}
      {c.label}
    </span>
  )
}

// ── Session Card ──
const SessionCard = ({
  appt,
  onCancel,
  cancelling,
}: {
  appt: Appointment
  onCancel: (id: string) => void
  cancelling: boolean
}) => {
  const color = getColor(appt.counselor?.fullName || '')
  const initials = getInitials(appt.counselor?.fullName || '')
  const isOnline = appt.counselingType === 'online'
  const isApproved = appt.status === 'APPROVED'

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={cn('w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0', color)}>
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{appt.counselor?.fullName}</p>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1">
            <StatusBadge status={appt.status} />
            <span className="text-muted-foreground">•</span>
            <span className={cn('flex items-center gap-1 text-xs font-medium', isOnline ? 'text-blue-600' : 'text-green-600')}>
              {isOnline ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{appt.counselor?.specialization}</span>
          </div>
        </div>

        {/* Date & Time */}
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(appt.appointmentDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTime(appt.startTime)} - {formatTime(appt.endTime)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onCancel(appt.id)}
            disabled={cancelling}
            className="px-3.5 py-2 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            Batal
          </button>

          {isApproved && isOnline && appt.meetingLink && (
            <a
              href={appt.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Video className="h-3.5 w-3.5" />
              Gabung Meet
            </a>
          )}

          {(isApproved || appt.status === 'PENDING') && !isOnline && (
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors">
              <MapPin className="h-3.5 w-3.5" />
              Detail Ruangan
            </button>
          )}

          {isApproved && isOnline && !appt.meetingLink && (
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Video className="h-3.5 w-3.5" />
              Gabung Meet
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── History Item ──
const HistoryItem = ({
  appt,
  onReview,
  onDelete,
  deleting,
}: {
  appt: Appointment
  onReview: (id: string, counselorName: string) => void
  onDelete: (id: string) => void
  deleting: boolean
}) => {
  const color = getColor(appt.counselor?.fullName || '')
  const initials = getInitials(appt.counselor?.fullName || '')
  const isCompleted = appt.status === 'COMPLETED'

  return (
    <div className="flex items-center gap-3 py-3 px-3 hover:bg-secondary/20 rounded-lg transition-colors">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0', color)}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{appt.counselor?.fullName}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(appt.appointmentDate)} • {appt.counselor?.specialization}
        </p>
      </div>
      <StatusBadge status={appt.status} />
      {isCompleted ? (
        <button
          onClick={() => onReview(appt.id, appt.counselor?.fullName || '')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors shrink-0"
        >
          <Star className="h-3 w-3" /> Beri Ulasan
        </button>
      ) : (
        <XCircle className="h-4 w-4 text-red-400 shrink-0" />
      )}
      <button
        onClick={() => onDelete(appt.id)}
        disabled={deleting}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 shrink-0"
        title="Hapus riwayat"
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  )
}

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

// ── Main Page ──
export default function JadwalSaya() {
  const [all, setAll] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [historySearch, setHistorySearch] = useState('')
  const [reviewTarget, setReviewTarget] = useState<{ id: string; name: string } | null>(null)
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set())
  const [deletingHistory, setDeletingHistory] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const res = await api.get('/appointments/student')
      setAll(res.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat jadwal.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAppointments() }, [])

  const handleCancel = async (id: string) => {
    setCancelling(id)
    try {
      await api.delete(`/appointments/${id}`)
      toast.success('Janji temu berhasil dibatalkan.')
      await fetchAppointments()
      setConfirmAction(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membatalkan janji temu.')
    } finally {
      setCancelling(null)
    }
  }

  const handleDeleteHistory = async (id: string) => {
    setDeletingHistory(id)
    try {
      await api.delete(`/appointments/student-history/${id}`)
      toast.success('Riwayat sesi berhasil dihapus.')
      await fetchAppointments()
      setConfirmAction(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus riwayat sesi.')
    } finally {
      setDeletingHistory(null)
    }
  }

  const confirmModalCopy = confirmAction?.type === 'cancelAppointment'
    ? {
        title: 'Batalkan Janji Temu?',
        description: 'Janji temu akan dibatalkan dan slot konselor akan kembali tersedia untuk mahasiswa lain.',
        confirmLabel: 'Batalkan Janji',
        loading: cancelling === confirmAction.id,
      }
    : confirmAction?.type === 'deleteHistory'
      ? {
          title: 'Hapus Riwayat Sesi?',
          description: 'Riwayat ini akan disembunyikan dari tampilan Anda. Data utama tetap tersimpan untuk kebutuhan sistem.',
          confirmLabel: 'Hapus Riwayat',
          loading: deletingHistory === confirmAction.id,
        }
      : null

  const upcoming = all.filter(a => a.status === 'PENDING' || a.status === 'APPROVED')
  const history = all.filter(a => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(a.status))
  const filteredHistory = history.filter(a =>
    a.counselor?.fullName?.toLowerCase().includes(historySearch.toLowerCase()) ||
    a.counselor?.specialization?.toLowerCase().includes(historySearch.toLowerCase())
  )

  if (loading) return (
    <DashboardLayout role="student">
      <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </DashboardLayout>
  )

  if (error) return (
    <DashboardLayout role="student">
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle className="h-10 w-10 text-destructive opacity-50" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <button onClick={fetchAppointments} className="text-sm text-primary hover:underline">Coba lagi</button>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout role="student">
      {reviewTarget && (
        <ReviewModal
          appointmentId={reviewTarget.id}
          counselorName={reviewTarget.name}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => {
            setReviewedIds(prev => new Set([...prev, reviewTarget.id]))
            setReviewTarget(null)
          }}
        />
      )}
      {confirmAction && confirmModalCopy && (
        <ConfirmModal
          {...confirmModalCopy}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            if (confirmAction.type === 'cancelAppointment') handleCancel(confirmAction.id)
            if (confirmAction.type === 'deleteHistory') handleDeleteHistory(confirmAction.id)
          }}
        />
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Jadwal Saya</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola sesi mendatang Anda dan lihat riwayat sebelumnya.
        </p>
      </div>

      <div className="space-y-6">
        {/* ── Sesi Mendatang ── */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">Sesi Mendatang</h2>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map(a => (
                <SessionCard
                  key={a.id}
                  appt={a}
                  onCancel={(id) => setConfirmAction({ type: 'cancelAppointment', id })}
                  cancelling={cancelling === a.id}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Tidak ada sesi mendatang.</p>
              <button
                onClick={() => window.location.href = '/mahasiswa/cari-konselor'}
                className="mt-3 text-sm font-medium text-primary hover:underline"
              >
                Cari konselor sekarang →
              </button>
            </div>
          )}
        </section>

        {/* ── Riwayat Sesi ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Riwayat Sesi</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari sesi berlalu..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs rounded-lg border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-48"
              />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {filteredHistory.length > 0 ? (
              <div className="px-3 py-2 divide-y divide-border">
                {filteredHistory.map(a => (
                  <HistoryItem
                    key={a.id}
                    appt={a}
                    onReview={(id, name) => {
                      if (!reviewedIds.has(id)) setReviewTarget({ id, name })
                    }}
                    onDelete={(id) => setConfirmAction({ type: 'deleteHistory', id })}
                    deleting={deletingHistory === a.id}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <X className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  {historySearch ? 'Tidak ada riwayat yang cocok.' : 'Tidak ada riwayat ditemukan.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
