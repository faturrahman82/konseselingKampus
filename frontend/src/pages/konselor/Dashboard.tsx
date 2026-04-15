import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import {
  Clock,
  CalendarCheck,
  FileText,
  ChevronRight,
  CalendarDays,
  Video,
  X,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'
import { toast } from 'sonner'

// ── Types ──
interface DashboardData {
  metrics: {
    pendingRequests: number
    sessionsToday: number
    totalStudents: number
    counselingHours: number
  }
  pendingRequests: Array<{
    id: string
    student: { fullName: string; major: string }
    topicOrReason: string
    appointmentDate: string
    startTime: string
    endTime: string
  }>
  todaySchedule: Array<{
    id: string
    student: { fullName: string; major: string }
    startTime: string
    endTime: string
    counselingType: string
    meetingLink?: string
  }>
}

// ── Stat Card ──
const StatCard = ({
  label, value, sub, subColor, active,
}: {
  label: string; value: string | number; sub?: string; subColor?: string; active?: boolean
}) => (
  <div className={cn(
    'bg-card rounded-xl border p-5 transition-shadow hover:shadow-md',
    active ? 'border-primary/40 shadow-sm' : 'border-border'
  )}>
    <p className={cn('text-sm font-medium', active ? 'text-primary' : 'text-muted-foreground')}>{label}</p>
    <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
    {sub && <p className={cn('text-xs mt-1', subColor || 'text-muted-foreground')}>{sub}</p>}
  </div>
)

// ── Request Card ──
const RequestCard = ({
  id, name, type, date, time, onApprove, onReject, approving, rejecting,
}: {
  id: string; name: string; type: string; date: string; time: string
  onApprove: (id: string) => void; onReject: (id: string) => void
  approving: boolean; rejecting: boolean
}) => (
  <div className="border border-border rounded-xl p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{type}</p>
        </div>
      </div>
      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">pending</span>
    </div>
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{date}</span>
      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{time}</span>
    </div>
    <div className="flex gap-2 pt-1 justify-end">
      <button
        onClick={() => onReject(id)}
        disabled={approving || rejecting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
      >
        {rejecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
        Tolak
      </button>
      <button
        onClick={() => onApprove(id)}
        disabled={approving || rejecting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {approving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Setujui
      </button>
    </div>
  </div>
)

// ── Schedule Item ──
const ScheduleItem = ({ time, name, type, link }: {
  time: string; name: string; type: string; link?: string
}) => (
  <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground">{time}</p>
      <p className="text-xs text-muted-foreground truncate">{name} · {type}</p>
    </div>
    {link && (
      <a href={link} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
        <Video className="h-3.5 w-3.5" />Join
      </a>
    )}
  </div>
)

// ── Format helpers ──
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
const formatTime = (timeStr: string) => {
  if (!timeStr) return '-'
  try { return new Date(timeStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) }
  catch { return timeStr }
}

// ── Main Component ──
export default function KonselorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await api.get('/dashboard/counselor')
      setData(res.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data dasbor.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  const handleStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading({ id, type: status === 'APPROVED' ? 'approve' : 'reject' })
    try {
      await api.put(`/appointments/${id}/status`, { status })
      toast.success(status === 'APPROVED' ? '✅ Janji temu disetujui.' : '❌ Janji temu ditolak.')
      await fetchDashboard()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status.')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return (
    <DashboardLayout role="counselor">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  )

  if (error) return (
    <DashboardLayout role="counselor">
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle className="h-10 w-10 text-destructive opacity-50" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <button onClick={fetchDashboard} className="text-sm text-primary hover:underline">Coba lagi</button>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout role="counselor">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dasbor Konselor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Berikut adalah ringkasan aktivitas Anda hari ini.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Permintaan Menunggu" value={data?.metrics.pendingRequests ?? 0} sub="Perlu perhatian" active />
        <StatCard label="Sesi Hari Ini" value={data?.metrics.sessionsToday ?? 0} />
        <StatCard label="Total Mahasiswa" value={data?.metrics.totalStudents ?? 0} sub="Terdaftar" subColor="text-green-600" />
        <StatCard label="Jam Terdata" value={data?.metrics.counselingHours ?? 0} sub="Total jam" />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Appointment Requests */}
        <div className="lg:col-span-3 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Permintaan Janji Temu</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Tinjau dan kelola permintaan mahasiswa baru.</p>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {data?.pendingRequests && data.pendingRequests.length > 0 ? (
              data.pendingRequests.map(req => (
                <RequestCard
                  key={req.id}
                  id={req.id}
                  name={req.student?.fullName || 'Mahasiswa'}
                  type={req.topicOrReason || 'Konseling Umum'}
                  date={formatDate(req.appointmentDate)}
                  time={`${formatTime(req.startTime)} - ${formatTime(req.endTime)}`}
                  onApprove={(id) => handleStatus(id, 'APPROVED')}
                  onReject={(id) => handleStatus(id, 'REJECTED')}
                  approving={actionLoading?.id === req.id && actionLoading.type === 'approve'}
                  rejecting={actionLoading?.id === req.id && actionLoading.type === 'reject'}
                />
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Tidak ada permintaan baru.</p>
              </div>
            )}
          </div>

          <button className="w-full mt-4 text-sm font-medium text-primary hover:underline flex items-center justify-center gap-1">
            Lihat semua permintaan <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Jadwal Hari Ini</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Janji temu yang dikonfirmasi untuk hari ini.</p>
            </div>
            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
          </div>

          {data?.todaySchedule && data.todaySchedule.length > 0 ? (
            data.todaySchedule.map(s => (
              <ScheduleItem
                key={s.id}
                time={`${formatTime(s.startTime)} - ${formatTime(s.endTime)}`}
                name={s.student?.fullName || 'Mahasiswa'}
                type={s.counselingType}
                link={s.meetingLink}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Tidak ada sesi hari ini.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
