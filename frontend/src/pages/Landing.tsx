import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  HeartPulse,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react'
import { UniCounselIcon } from '@/layouts/AuthLayout'
import { cn } from '@/lib/utils'

const roleCards = [
  {
    title: 'Mahasiswa',
    description: 'Cari konselor, pilih jadwal yang tersedia, lakukan mood check-in, dan pantau riwayat sesi.',
    icon: Users,
    accent: 'text-blue-600 bg-blue-50 border-blue-100',
    items: ['Booking konseling', 'Mood check-in harian', 'Chat dengan konselor'],
  },
  {
    title: 'Konselor',
    description: 'Atur ketersediaan, kelola permintaan janji temu, dan pantau mahasiswa yang membutuhkan perhatian.',
    icon: UserCheck,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    items: ['Kelola slot jadwal', 'Approve atau tolak sesi', 'Catatan sesi'],
  },
  {
    title: 'Admin',
    description: 'Pantau layanan konseling kampus, kelola konselor, dan hasilkan laporan untuk kebutuhan institusi.',
    icon: BarChart3,
    accent: 'text-violet-600 bg-violet-50 border-violet-100',
    items: ['Manajemen konselor', 'Statistik sistem', 'Laporan periode'],
  },
]

const featureCards = [
  {
    title: 'Smart Appointment',
    description: 'Mahasiswa hanya melihat slot konselor yang tersedia dan dapat memilih sesi online atau offline.',
    icon: CalendarCheck,
  },
  {
    title: 'Mood Journey',
    description: 'Check-in harian membantu mahasiswa dan sistem membaca tren kesejahteraan dari waktu ke waktu.',
    icon: HeartPulse,
  },
  {
    title: 'Komunikasi Terarah',
    description: 'Chat membantu mahasiswa dan konselor tetap terhubung setelah jadwal konseling terbentuk.',
    icon: MessageSquareText,
  },
  {
    title: 'Privasi Berbasis Role',
    description: 'Akses sistem dibedakan untuk mahasiswa, konselor, dan admin agar data tetap terkontrol.',
    icon: LockKeyhole,
  },
]

const flowSteps = [
  'Mahasiswa membuat akun',
  'Profil akademik dilengkapi',
  'Pilih konselor dan slot jadwal',
  'Konselor meninjau permintaan',
  'Sesi konseling berlangsung',
  'Review dan laporan tersedia',
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <UniCounselIcon size={40} />
            <div>
              <p className="text-base font-bold tracking-tight">UniCounsel</p>
              <p className="text-xs text-muted-foreground">University Counseling Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Daftar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Dashboard pengenalan layanan konseling kampus
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Dukungan konseling mahasiswa dalam satu sistem terpadu.
              </h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
                UniCounsel membantu mahasiswa terhubung dengan konselor, mengatur jadwal,
                mencatat mood harian, dan membantu kampus memahami kebutuhan layanan kesehatan mental.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Mulai sebagai Mahasiswa
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Masuk ke Portal
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ['3 Role', 'Mahasiswa, konselor, admin'],
                ['1 Alur', 'Booking sampai laporan'],
                ['Privat', 'Akses sesuai peran pengguna'],
              ].map(([value, label]) => (
                <div key={value} className="rounded-lg border border-border bg-background p-4">
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Status Platform</p>
                <p className="text-xs text-muted-foreground">Ringkasan layanan utama</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-6 space-y-4">
              {[
                ['Booking Konseling', 'Mahasiswa memilih slot konselor yang tersedia.'],
                ['Approval Sesi', 'Konselor meninjau dan mengonfirmasi jadwal.'],
                ['Monitoring Kampus', 'Admin melihat statistik dan laporan layanan.'],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {roleCards.map((card) => {
            const Icon = card.icon
            return (
              <article key={card.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-lg border', card.accent)}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-bold text-foreground">{card.title}</h2>
                <p className="mt-2 min-h-16 text-sm leading-6 text-muted-foreground">{card.description}</p>
                <div className="mt-4 space-y-2">
                  {card.items.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">Alur Penggunaan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Proses dibuat sederhana agar mahasiswa bisa segera menemukan bantuan yang tepat.
            </p>

            <div className="mt-5 space-y-3">
              {flowSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-foreground">
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Fitur Utama</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Modul inti yang mendukung proses konseling dari awal sampai evaluasi.
                </p>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                <HeartPulse className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {featureCards.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="rounded-lg border border-border bg-background p-4">
                    <Icon className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-bold text-foreground">{feature.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-primary p-6 text-primary-foreground shadow-sm md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Siap mulai menggunakan UniCounsel?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/80">
                Daftar sebagai mahasiswa untuk membuat janji konseling, atau masuk jika kamu sudah memiliki akun.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
              >
                Daftar Mahasiswa
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Masuk
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
