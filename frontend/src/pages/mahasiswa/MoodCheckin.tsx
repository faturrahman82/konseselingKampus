import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Smile, Meh, Frown, CheckCircle2, Loader2, TrendingUp, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'
import { toast } from 'sonner'

interface MoodOption {
  value: number
  label: string
  emoji: string
  desc: string
  color: string
  bg: string
  icon: typeof Smile
}

const MOODS: MoodOption[] = [
  { value: 4,  label: 'Sangat Baik', emoji: '😊', desc: 'Hari ini terasa menyenangkan!', color: 'text-green-600', bg: 'bg-green-50 border-green-200 hover:bg-green-100', icon: Smile },
  { value: 1,  label: 'Biasa Saja',  emoji: '😐', desc: 'Hari biasa, tidak ada yang spesial.', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100', icon: Meh },
  { value: -2, label: 'Kurang Baik', emoji: '😔', desc: 'Ada sesuatu yang mengganggu pikiran.', color: 'text-red-500', bg: 'bg-red-50 border-red-200 hover:bg-red-100', icon: Frown },
]

interface Status {
  has_checked_in_today: boolean
  todayMood: number | null
  current_wellbeing_score: number
}

interface HistoryItem {
  date: string
  moodValue: number
  createdAt: string
}

const moodLabel = (v: number) => MOODS.find(m => m.value === v)?.label ?? '-'
const moodEmoji = (v: number) => MOODS.find(m => m.value === v)?.emoji ?? '❓'
const moodColor = (v: number) => {
  if (v === 4) return 'bg-green-400'
  if (v === 1) return 'bg-yellow-400'
  return 'bg-red-400'
}

function WellbeingBar({ score }: { score: number }) {
  // Score 0–100 (naik dengan mood baik)
  const pct = Math.max(0, Math.min(100, score))
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
        <span>Skor Kesejahteraan</span>
        <span className="font-semibold text-foreground">{pct}/100</span>
      </div>
      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-1000', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function MoodCheckin() {
  const [status, setStatus] = useState<Status | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)

  const fetchData = async () => {
    try {
      const [statusRes, histRes] = await Promise.all([
        api.get('/wellbeing/status'),
        api.get('/wellbeing/history'),
      ])
      const statusData = statusRes.data.data
      const histData: HistoryItem[] = histRes.data.data || []
      // Ambil mood hari ini dari history (entry paling baru)
      const todayStr = new Date().toISOString().split('T')[0]
      const todayEntry = histData.find(h => h.createdAt?.startsWith?.(todayStr) || new Date(h.createdAt).toISOString().startsWith(todayStr))
      setStatus({ ...statusData, todayMood: todayEntry?.moodValue ?? null })
      setHistory(histData)
    } catch {
      toast.error('Gagal memuat data mood.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCheckin = async () => {
    if (selected === null) return
    setSubmitting(true)
    try {
      await api.post('/wellbeing/check-in', { moodValue: selected })
      toast.success('Mood hari ini berhasil dicatat! 🎉')
      setSelected(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan mood.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  const last7 = history.slice(-7)
  const alreadyCheckedIn = status?.has_checked_in_today ?? false

  return (
    <DashboardLayout role="student">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mood Check-in Harian</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Catat perasaanmu setiap hari untuk memantau kesejahteraan mental.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-in Card */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card border border-border rounded-2xl p-6">
            {alreadyCheckedIn ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">{moodEmoji(status?.todayMood ?? 0)}</div>
                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold text-lg mb-1">
                  <CheckCircle2 className="h-5 w-5" />
                  Sudah Check-in Hari Ini
                </div>
                <p className="text-sm text-muted-foreground">
                  Mood kamu: <span className="font-medium text-foreground">{moodLabel(status?.todayMood ?? 0)}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">Kembali besok untuk check-in lagi 😊</p>
              </div>
            ) : (
              <>
                <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Bagaimana perasaanmu hari ini?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  {MOODS.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => setSelected(mood.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 text-left',
                        mood.bg,
                        selected === mood.value
                          ? 'border-primary ring-2 ring-primary/30 scale-[1.02]'
                          : 'border-transparent'
                      )}
                    >
                      <span className="text-4xl">{mood.emoji}</span>
                      <span className={cn('text-sm font-bold', mood.color)}>{mood.label}</span>
                      <span className="text-xs text-muted-foreground text-center">{mood.desc}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCheckin}
                  disabled={selected === null || submitting}
                  className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan Mood Hari Ini
                </button>
              </>
            )}
          </div>

          {/* History 7 Hari */}
          {last7.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Mood 7 Hari Terakhir
              </h2>
              <div className="flex items-end gap-2 h-28">
                {last7.map((item, i) => {
                  const h = item.moodValue === 4 ? 100 : item.moodValue === 1 ? 55 : 25
                  const date = new Date(item.createdAt)
                  const day = date.toLocaleDateString('id-ID', { weekday: 'short' })
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-xs">{moodEmoji(item.moodValue)}</span>
                      <div className="w-full rounded-t-md transition-all" style={{ height: `${h}%`, backgroundColor: '' }}>
                        <div className={cn('w-full h-full rounded-t-md', moodColor(item.moodValue))} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{day}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* Wellbeing Score */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Skor Kesejahteraan</h3>
            <WellbeingBar score={status?.current_wellbeing_score ?? 0} />
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Skor ini dihitung dari riwayat mood kamu. Check-in rutin setiap hari untuk menjaga skor tetap tinggi!
            </p>
          </div>

          {/* Tips */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Tips Kesehatan Mental 💡</h3>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex gap-2"><span>🧘</span> Luangkan 10 menit untuk meditasi atau napas dalam</li>
              <li className="flex gap-2"><span>🚶</span> Berjalan kaki singkat membantu menjernihkan pikiran</li>
              <li className="flex gap-2"><span>💬</span> Cerita ke teman atau konselor jika merasa berat</li>
              <li className="flex gap-2"><span>😴</span> Tidur 7–8 jam per malam sangat penting</li>
              <li className="flex gap-2"><span>📵</span> Batasi screen time sebelum tidur</li>
            </ul>
          </div>

          {/* CTA Konselor */}
          <div className="bg-card border border-border rounded-2xl p-5 text-center">
            <p className="text-xs text-muted-foreground mb-3">
              Merasa perlu bicara dengan profesional?
            </p>
            <a
              href="/mahasiswa/cari-konselor"
              className="block w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Temui Konselor Sekarang
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
