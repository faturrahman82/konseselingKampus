import { useEffect, useState, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Search, SlidersHorizontal, X, Video, MapPin, Loader2, Calendar, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'
import { toast } from 'sonner'
import { queryKeys } from '@/api/queryKeys'

// ── Types ──
interface Slot {
  id: string
  date: string
  startTime: string
  endTime: string
}

interface Counselor {
  id: string
  fullName: string
  specialization: string
  bioDescription?: string
  avatarUrl?: string
  availableSlots: Slot[]
}

interface BookingState {
  counselor: Counselor
  slot: Slot
}

// ── Avatar color helper ──
const AVATAR_COLORS = [
  'bg-teal-500', 'bg-violet-500', 'bg-blue-500', 'bg-rose-500', 'bg-amber-500',
]
const getColor = (name: string) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]
const getInitials = (name: string) => name?.split(' ').map(n => n[0]).slice(0, 3).join('').toUpperCase() || '??'

// ── Format time from ISO datetime ──
const formatSlotTime = (t: string) => {
  try { return new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) }
  catch { return t.substring(11, 16) }
}

const formatSlotDate = (d: string) => {
  try {
    const date = new Date(d)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
    if (date.toDateString() === today.toDateString()) return 'Hari Ini'
    if (date.toDateString() === tomorrow.toDateString()) return 'Besok'
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
  } catch { return d }
}

// ── Booking Confirmation Modal ──
const BookingModal = ({
  booking,
  onClose,
  onConfirm,
  confirming,
}: {
  booking: BookingState
  onClose: () => void
  onConfirm: (mode: string, topic: string) => Promise<void>
  confirming: boolean
}) => {
  const [mode, setMode] = useState<'online' | 'offline'>('online')
  const [topic, setTopic] = useState('')
  const [err, setErr] = useState('')

  const handleConfirm = async () => {
    if (!topic.trim()) { setErr('Tolong isi alasan konseling.'); return }
    setErr('')
    await onConfirm(mode, topic)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Konfirmasi Jadwal</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-muted-foreground -mt-2">
            Tinjau detail janji temu Anda sebelum mengonfirmasi.
          </p>

          {/* Detail rows */}
          <div className="rounded-xl border border-border divide-y divide-border">
            {[
              { label: 'Konselor', value: booking.counselor.fullName },
              { label: 'Spesialisasi', value: booking.counselor.specialization },
              { label: 'Tanggal', value: formatSlotDate(booking.slot.date) },
              {
                label: 'Waktu',
                value: `${formatSlotTime(booking.slot.startTime)} - ${formatSlotTime(booking.slot.endTime)}`
              },
            ].map(row => (
              <div key={row.label} className="flex items-center px-4 py-3">
                <span className="text-sm text-muted-foreground w-28 shrink-0">{row.label}</span>
                <span className="text-sm font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Metode Konseling */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Metode Konseling</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('online')}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 transition-all',
                  mode === 'online'
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                )}
              >
                <Video className="h-4 w-4" />Online (Meet)
              </button>
              <button
                onClick={() => setMode('offline')}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 transition-all',
                  mode === 'offline'
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                )}
              >
                <MapPin className="h-4 w-4" />Offline (Kampus)
              </button>
            </div>
          </div>

          {/* Topik / Alasan */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Alasan Konseling</p>
            <textarea
              rows={3}
              placeholder="Ceritakan singkat apa yang ingin Anda konsultasikan..."
              value={topic}
              onChange={e => { setTopic(e.target.value); setErr('') }}
              className={cn(
                'w-full px-3 py-2.5 text-sm rounded-xl border bg-background resize-none',
                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors',
                err ? 'border-destructive' : 'border-input'
              )}
            />
            {err && <p className="text-xs text-destructive mt-1">{err}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {confirming ? <><Loader2 className="h-4 w-4 animate-spin" />Memproses...</> : 'Konfirmasi Janji'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Counselor Card ──
const CounselorCard = ({
  counselor,
  onSelectSlot,
}: {
  counselor: Counselor
  onSelectSlot: (counselor: Counselor, slot: Slot) => void
}) => {
  const color = getColor(counselor.fullName)
  const initials = getInitials(counselor.fullName)

  // Group slots by date label and get first 3
  const displaySlots = counselor.availableSlots.slice(0, 6)
  const todaySlots = displaySlots.filter(s => new Date(s.date).toDateString() === new Date().toDateString())
  const slots = todaySlots.length > 0 ? todaySlots : displaySlots.slice(0, 3)
  const dateLabel = todaySlots.length > 0 ? 'Tersedia Hari Ini:' : 'Tersedia Berikutnya:'

  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Counselor info */}
      <div className="flex items-start gap-3">
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0', color)}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">{counselor.fullName}</p>
          <p className={cn('text-xs font-medium mt-0.5', color.replace('bg-', 'text-'))}>
            {counselor.specialization}
          </p>
        </div>
      </div>

      {/* Bio */}
      {counselor.bioDescription && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {counselor.bioDescription}
        </p>
      )}

      {/* Time slots */}
      <div>
        <p className="text-xs font-medium text-foreground mb-2">{dateLabel}</p>
        {slots.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {slots.map(slot => (
              <button
                key={slot.id}
                onClick={() => onSelectSlot(counselor, slot)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {formatSlotTime(slot.startTime)}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">Tidak ada slot tersedia.</p>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={() => slots.length > 0 ? onSelectSlot(counselor, slots[0]) : null}
        disabled={slots.length === 0}
        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Lihat Jadwal & Pesan
      </button>
    </div>
  )
}

// ── Main Page ──
const SPECIALIZATIONS = ['Konseling Umum', 'Stres Akademik', 'Bimbingan Karir', 'Pengembangan Diri', 'Hubungan Sosial']

export default function CariKonselor() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterSpec, setFilterSpec] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [booking, setBooking] = useState<BookingState | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(timer)
  }, [search])

  const { data: counselors = [], isPending: loading } = useQuery<Counselor[]>({
    queryKey: queryKeys.schedules(debouncedSearch, filterSpec),
    queryFn: async ({ signal }) => {
      const res = await api.get('/schedules', {
        params: {
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...(filterSpec ? { specialization: filterSpec } : {}),
        },
        signal,
      })
      return res.data.data || []
    },
  })

  const bookingMutation = useMutation({
    mutationFn: ({ mode, topic }: { mode: string; topic: string }) =>
      api.post('/appointments', {
        scheduleId: booking?.slot.id,
        counselingType: mode,
        topicOrReason: topic,
      }),
    onSuccess: () => {
      toast.success(`Janji temu dengan ${booking?.counselor.fullName} berhasil dibuat! Tunggu konfirmasi konselor.`)
      setBooking(null)
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments('student') })
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message
      toast.error(message || 'Gagal membuat janji temu.')
    },
  })

  const handleConfirmBooking = async (mode: string, topic: string) => {
    if (!booking) return
    await bookingMutation.mutateAsync({ mode, topic }).catch(() => undefined)
  }

  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Cari Konselor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pilih konselor dan tentukan waktu yang tersedia.
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-6 relative">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau spesialisasi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>

        <div ref={filterRef} className="relative">
          <button
            onClick={() => setShowFilter(v => !v)}
            className={cn(
              'flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium border transition-colors',
              showFilter || filterSpec
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-foreground hover:bg-secondary'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Saring
            {filterSpec && <span className="w-2 h-2 bg-white rounded-full" />}
          </button>

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="absolute right-0 top-12 w-56 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden">
              <div className="p-2">
                <p className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Saring Spesialisasi
                </p>
                {SPECIALIZATIONS.map(spec => (
                  <button
                    key={spec}
                    onClick={() => { setFilterSpec(filterSpec === spec ? '' : spec); setShowFilter(false) }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      filterSpec === spec ? 'bg-accent text-primary font-semibold' : 'text-foreground hover:bg-secondary'
                    )}
                  >
                    {spec}
                  </button>
                ))}
                <div className="border-t border-border my-1" />
                <p className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ketersediaan
                </p>
                {['Tersedia Hari Ini', 'Tersedia Minggu Ini'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setShowFilter(false)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active filter chip */}
      {filterSpec && (
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-accent text-primary text-xs font-medium rounded-full">
            {filterSpec}
            <button onClick={() => setFilterSpec('')}>
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : counselors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {search || filterSpec
              ? 'Tidak ada konselor yang cocok dengan pencarian Anda.'
              : 'Belum ada konselor dengan jadwal tersedia saat ini.'}
          </p>
          {(search || filterSpec) && (
            <button onClick={() => { setSearch(''); setFilterSpec('') }} className="text-sm text-primary hover:underline">
              Hapus filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {counselors.map(c => (
            <CounselorCard
              key={c.id}
              counselor={c}
              onSelectSlot={(counselor, slot) => setBooking({ counselor, slot })}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {booking && (
        <BookingModal
          booking={booking}
          onClose={() => setBooking(null)}
          onConfirm={handleConfirmBooking}
          confirming={bookingMutation.isPending}
        />
      )}
    </DashboardLayout>
  )
}
