import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Loader2,
  MessageCircleHeart,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/api/axios'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { cn } from '@/lib/utils'

interface MoodOption {
  value: number
  label: string
  emoji: string
  description: string
  textColor: string
  optionStyle: string
}

const MOODS: MoodOption[] = [
  {
    value: 4,
    label: 'Sangat Baik',
    emoji: '😊',
    description: 'Hari ini terasa menyenangkan.',
    textColor: 'text-green-600',
    optionStyle: 'bg-green-50 border-green-200 hover:bg-green-100',
  },
  {
    value: 1,
    label: 'Biasa Saja',
    emoji: '😐',
    description: 'Hari berjalan seperti biasanya.',
    textColor: 'text-yellow-600',
    optionStyle: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
  },
  {
    value: -2,
    label: 'Kurang Baik',
    emoji: '😔',
    description: 'Ada sesuatu yang terasa berat.',
    textColor: 'text-red-500',
    optionStyle: 'bg-red-50 border-red-200 hover:bg-red-100',
  },
]

interface Status {
  has_checked_in_today: boolean
  todayMood: number | null
  current_wellbeing_score: number
  checkedInAt?: string | null
}

interface HistoryItem {
  moodValue: number
  createdAt: string
}

const moodLabel = (value: number) => MOODS.find(mood => mood.value === value)?.label ?? 'Tidak diketahui'
const moodEmoji = (value: number) => MOODS.find(mood => mood.value === value)?.emoji ?? '❓'
const moodTone = (value: number) => {
  if (value === 4) return 'border-green-500/30 bg-green-500/10 text-green-600'
  if (value === 1) return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600'
  return 'border-red-500/30 bg-red-500/10 text-red-500'
}

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === 'object'
    && error !== null
    && 'response' in error
  ) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    return response?.data?.message
  }
  return undefined
}

function WellbeingBar({ score }: { score: number }) {
  const percentage = Math.max(0, Math.min(100, score))
  const color = percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
        <span>Skor Kesejahteraan</span>
        <span className="font-semibold text-foreground">{percentage}/100</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn('h-full rounded-full transition-all duration-1000', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function MoodCheckin() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [statusResponse, historyResponse] = await Promise.all([
        api.get('/wellbeing/status'),
        api.get('/wellbeing/history'),
      ])
      setStatus(statusResponse.data.data)
      setHistory(historyResponse.data.data || [])
    } catch {
      toast.error('Gagal memuat data mood.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCheckin = async () => {
    if (selected === null) return
    setSubmitting(true)
    try {
      await api.post('/wellbeing/check-in', { moodValue: selected })
      toast.success('Mood hari ini berhasil dicatat.')
      setSelected(null)
      await fetchData()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Gagal menyimpan mood.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  const lastSevenCheckins = [...history].slice(-7).reverse()
  const alreadyCheckedIn = status?.has_checked_in_today ?? false

  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mood Check-in Harian</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Catat perasaanmu setiap hari untuk memantau kesejahteraan mental.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            {alreadyCheckedIn ? (
              <div className="py-6 text-center">
                <div className="mb-3 text-5xl">{moodEmoji(status?.todayMood ?? 0)}</div>
                <div className="mb-1 flex items-center justify-center gap-2 text-lg font-semibold text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Sudah Check-in Hari Ini
                </div>
                <p className="text-sm text-muted-foreground">
                  Mood kamu: <span className="font-medium text-foreground">{moodLabel(status?.todayMood ?? 0)}</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Pilihan mood akan tersedia kembali besok.
                </p>
              </div>
            ) : (
              <>
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  Bagaimana perasaanmu hari ini?
                </h2>
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {MOODS.map(mood => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setSelected(mood.value)}
                      aria-pressed={selected === mood.value}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-left transition-all duration-150',
                        mood.optionStyle,
                        selected === mood.value
                          ? 'scale-[1.02] border-primary ring-2 ring-primary/30'
                          : 'border-transparent',
                      )}
                    >
                      <span className="text-4xl">{mood.emoji}</span>
                      <span className={cn('text-sm font-bold', mood.textColor)}>{mood.label}</span>
                      <span className="text-center text-xs text-muted-foreground">{mood.description}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCheckin}
                  disabled={selected === null || submitting}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan Mood Hari Ini
                </button>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Mood 7 Hari Terakhir
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Lihat pola perasaanmu tanpa menghakimi diri sendiri.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {lastSevenCheckins.length} check-in
              </span>
            </div>

            {lastSevenCheckins.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {lastSevenCheckins.map((item, index) => {
                  const date = new Date(item.createdAt)
                  const day = date.toLocaleDateString('id-ID', { weekday: 'long' })
                  const fullDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

                  return (
                    <div
                      key={`${item.createdAt}-${index}`}
                      className={cn('rounded-xl border p-4', moodTone(item.moodValue))}
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-3xl leading-none">{moodEmoji(item.moodValue)}</span>
                        {index === 0 && (
                          <span className="rounded-full bg-card/80 px-2 py-1 text-[10px] font-semibold">
                            Terbaru
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold">{moodLabel(item.moodValue)}</p>
                      <p className="mt-1 text-xs capitalize opacity-80">{day}, {fullDate}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center">
                <Calendar className="mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Belum ada riwayat mood</p>
                <p className="mt-1 text-xs text-muted-foreground">Check-in pertamamu akan muncul di sini.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Skor Kesejahteraan</h3>
            <WellbeingBar score={status?.current_wellbeing_score ?? 0} />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Skor ini dihitung dari riwayat mood kamu. Check-in rutin membantu kamu melihat perubahan perasaan.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Tips Kesehatan Mental</h3>
            <ul className="list-disc space-y-2 pl-4 text-xs text-muted-foreground">
              <li>Luangkan waktu untuk bernapas perlahan dan beristirahat.</li>
              <li>Berjalan kaki singkat dapat membantu menjernihkan pikiran.</li>
              <li>Ceritakan yang terasa berat kepada orang tepercaya atau konselor.</li>
              <li>Usahakan tidur cukup dan kurangi layar sebelum tidur.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <p className="mb-3 text-xs text-muted-foreground">
              Merasa perlu bicara dengan profesional?
            </p>
            <button
              type="button"
              onClick={() => navigate('/mahasiswa/cari-konselor')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <MessageCircleHeart className="h-4 w-4" />
              Temui Konselor Sekarang
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
