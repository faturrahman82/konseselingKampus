import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import {
  CalendarPlus, Clock, Video, MapPin, ChevronRight,
  Loader2, AlertCircle, TrendingUp, CheckCircle2, Smile,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'
import { useNavigate } from 'react-router-dom'

interface DashboardData {
  profile: {
    fullName: string
    wellbeingScore: number
    hasCheckedInToday: boolean
    smartInsight: string
  }
  stats: {
    totalSessions: number
    sessionsThisMonth: number
  }
  upcomingAppointment: {
    id: string
    appointmentDate: string
    startTime: string
    endTime: string
    status: string
    counselingType: string
    meetingLink?: string
    counselor: { fullName: string; specialization: string }
    topicOrReason: string
  } | null
  recentHistory: Array<{
    id: string
    appointmentDate: string
    status: string
    counselingType: string
    counselor: { fullName: string; specialization: string }
    topicOrReason: string
  }>
}

// Helper: generate avatar color from name
const avatarColor = (name: string) => {
  const colors = ['bg-teal-500', 'bg-blue-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500']
  const i = (name?.charCodeAt(0) || 0) % colors.length
  return colors[i]
}

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'

const formatTime = (t: string) => {
  try { return t ? new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-' }
  catch { return t || '-' }
}

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; class: string }> = {
    APPROVED: { label: 'Dikonfirmasi', class: 'bg-green-100 text-green-700' },
    PENDING: { label: 'Menunggu Persetujuan', class: 'bg-gray-100 text-gray-700 border border-gray-300' },
    COMPLETED: { label: 'Selesai', class: 'bg-blue-100 text-blue-700' },
    CANCELLED: { label: 'Dibatalkan', class: 'bg-red-100 text-red-700' },
    REJECTED: { label: 'Ditolak', class: 'bg-red-100 text-red-700' },
  }
  const c = map[status] || map.PENDING
  return <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', c.class)}>{c.label}</span>
}

// moodValue: 4 = Sangat Baik, 1 = Biasa, -2 = Kurang
const MOODS = [
  { emoji: '😊', label: 'Sangat Baik', value: 'great', moodValue: 4 },
  { emoji: '😐', label: 'Biasa', value: 'neutral', moodValue: 1 },
  { emoji: '😟', label: 'Kurang', value: 'bad', moodValue: -2 },
]

export default function MahasiswaDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [checkinDone, setCheckinDone] = useState(false)
  const navigate = useNavigate()

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await api.get('/dashboard/student')
      setData(res.data.data)
      if (res.data.data?.profile?.hasCheckedInToday) {
        setCheckinDone(true)
        setSelectedMood('done')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data dasbor.')
    } finally {
      setLoading(false)
    }
  }

  const handleMoodCheckin = async (mood: typeof MOODS[0]) => {
    if (checkinDone || checkinLoading) return
    setSelectedMood(mood.value)
    setCheckinLoading(true)
    try {
      await api.post('/wellbeing/check-in', { moodValue: mood.moodValue })
      setCheckinDone(true)
      // Refresh score
      const res = await api.get('/dashboard/student')
      setData(res.data.data)
    } catch (err: any) {
      // Sudah check-in hari ini atau error lain
      setCheckinDone(true)
    } finally {
      setCheckinLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

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
        <button onClick={fetchDashboard} className="text-sm text-primary hover:underline">Coba lagi</button>
      </div>
    </DashboardLayout>
  )

  const upcoming = data?.upcomingAppointment
  const initials = upcoming?.counselor?.fullName?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'DR'
  const bgColor = avatarColor(upcoming?.counselor?.fullName || '')

  return (
    <DashboardLayout role="student">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Selamat datang kembali, {data?.profile.fullName?.split(' ')[0] || 'Mahasiswa'}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Berikut adalah ringkasan sesi konseling Anda.
          </p>
        </div>
        <button
          onClick={() => navigate('/mahasiswa/cari-konselor')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <CalendarPlus className="h-4 w-4" />
          + Buat Janji
        </button>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column (65%) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Jadwal Mendatang */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <CalendarPlus className="h-4 w-4 text-primary" />
                Jadwal Mendatang
              </h2>
              {upcoming && <StatusBadge status={upcoming.status} />}
            </div>

            {upcoming ? (
              <div>
                <p className="text-xs text-muted-foreground mb-4">
                  Sesi Anda selanjutnya akan segera tiba.
                </p>
                {/* Counselor Info Row */}
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0', bgColor)}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{upcoming.counselor?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{upcoming.counselor?.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatDate(upcoming.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatTime(upcoming.startTime)} - {formatTime(upcoming.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {upcoming.counselingType === 'online'
                        ? <><Video className="h-3.5 w-3.5 shrink-0" /><span>Pertemuan Daring</span></>
                        : <><MapPin className="h-3.5 w-3.5 shrink-0" /><span>Pertemuan Langsung</span></>
                      }
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={() => navigate('/mahasiswa/jadwal')}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors"
                    >
                      Jadwalkan Ulang
                    </button>
                    {upcoming.status === 'APPROVED' && upcoming.counselingType === 'online' && upcoming.meetingLink ? (
                      <a
                        href={upcoming.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Video className="h-4 w-4" />
                        Ikuti Sesi
                      </a>
                    ) : (
                      <button
                        onClick={() => navigate('/mahasiswa/jadwal')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Video className="h-4 w-4" />
                        Ikuti Sesi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <CalendarPlus className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground mb-3">Belum ada jadwal mendatang.</p>
                <button
                  onClick={() => navigate('/mahasiswa/cari-konselor')}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Buat janji temu sekarang →
                </button>
              </div>
            )}
          </div>

          {/* Riwayat Terbaru */}
          {data?.recentHistory && data.recentHistory.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-base font-semibold text-foreground mb-4">Riwayat Terbaru</h2>
              <div className="divide-y divide-border">
                {data.recentHistory.map(h => {
                  const hInitials = h.counselor?.fullName?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'DR'
                  const hColor = avatarColor(h.counselor?.fullName || '')
                  return (
                    <div key={h.id} className="flex items-center gap-3 py-3 hover:bg-secondary/20 rounded-lg px-2 transition-colors cursor-pointer">
                      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0', hColor)}>
                        {hInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{h.counselor?.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(h.appointmentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' • '}{h.counselor?.specialization}
                        </p>
                      </div>
                      <StatusBadge status={h.status} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column (35%) ── */}
        <div className="space-y-4">
          {/* Skor Kesejahteraan */}
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">Skor Kesejahteraan</p>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold text-foreground">
                {data?.profile.wellbeingScore ?? 0}
              </span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>

            {checkinDone ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-100 dark:bg-green-500/20">
                <Smile className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">Kamu sudah check-in mood hari ini ✅</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-3">Bagaimana perasaan Anda hari ini?</p>
                <div className="flex gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => handleMoodCheckin(m)}
                      disabled={checkinLoading}
                      className={cn(
                        'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all',
                        selectedMood === m.value
                          ? 'border-green-500 bg-green-100 dark:bg-green-500/20'
                          : 'border-transparent bg-white dark:bg-card hover:border-green-300 dark:hover:border-green-700',
                        checkinLoading && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      {checkinLoading && selectedMood === m.value
                        ? <Loader2 className="h-5 w-5 animate-spin text-green-600 dark:text-green-400" />
                        : <span className="text-xl">{m.emoji}</span>
                      }
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Total Sesi */}
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Sesi</p>
            <p className="text-4xl font-bold text-foreground">{data?.stats.totalSessions ?? 0}</p>
            {(data?.stats.sessionsThisMonth ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                <p className="text-xs text-green-600 dark:text-green-400">{data?.stats.sessionsThisMonth} selesai bulan ini</p>
              </div>
            )}
          </div>

          {/* Smart Insight */}
          {data?.profile.smartInsight && (
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-5">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1.5">💡 Saran Konselor</p>
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">{data.profile.smartInsight}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
