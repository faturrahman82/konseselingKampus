import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  HeartHandshake,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react'
import { UniCounselIcon } from '@/layouts/AuthLayout'

const challenges = [
  {
    title: 'Saat semuanya terasa terlalu berat',
    description: 'Tugas, hubungan, keluarga, keuangan, dan harapan orang lain dapat menumpuk sampai rasanya sulit bernapas.',
    icon: Users,
  },
  {
    title: 'Tidak tahu harus bercerita ke siapa',
    description: 'Ada hal yang sulit diceritakan kepada teman atau keluarga. Kamu tetap pantas didengar tanpa dihakimi.',
    icon: HeartHandshake,
  },
  {
    title: 'Merasa sendirian dan kehilangan arah',
    description: 'Ketika rasa sepi atau putus asa datang, meminta bantuan bukan tanda lemah. Itu langkah untuk menjaga diri.',
    icon: HeartPulse,
  },
  {
    title: 'Takut perasaanmu dianggap sepele',
    description: 'Apa yang kamu rasakan nyata. Konselor hadir untuk memahami ceritamu dan mencari langkah yang mungkin dilakukan.',
    icon: ShieldCheck,
  },
]

const solutions = [
  {
    title: 'Temukan seseorang untuk mendengar',
    description: 'Pilih konselor yang sesuai dengan kebutuhanmu dan tentukan waktu berbicara yang terasa nyaman.',
    icon: CalendarCheck,
    number: '01',
  },
  {
    title: 'Ceritakan tanpa harus terlihat baik-baik saja',
    description: 'Kamu tidak perlu menyiapkan kata-kata sempurna. Mulailah dari hal kecil yang paling ingin kamu keluarkan.',
    icon: HeartHandshake,
    number: '02',
  },
  {
    title: 'Susun langkah bersama konselor',
    description: 'Konselor membantu memahami situasi, mengenali kebutuhanmu, dan menyusun langkah yang realistis secara bertahap.',
    icon: UserCheck,
    number: '03',
  },
  {
    title: 'Tetap terhubung setelah sesi',
    description: 'Pantau perasaanmu, lihat riwayat sesi, dan lanjutkan komunikasi agar proses pemulihan tidak harus dijalani sendirian.',
    icon: HeartPulse,
    number: '04',
  },
]

const actors = [
  {
    title: 'Mahasiswa',
    description: 'Kamu boleh datang saat merasa lelah, bingung, takut, atau hanya membutuhkan ruang untuk bercerita. Tidak harus menunggu sampai keadaan menjadi sangat buruk.',
    icon: Users,
    color: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  },
  {
    title: 'Konselor',
    description: 'Konselor hadir untuk mendengar tanpa menghakimi, memahami apa yang sedang kamu hadapi, dan menemani kamu menemukan langkah berikutnya.',
    icon: UserCheck,
    color: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  },
]

const flowSteps = [
  ['01', 'Temukan konselor', 'Mahasiswa memilih konselor dan jadwal yang paling sesuai.'],
  ['02', 'Ajukan sesi', 'Permintaan dikirim secara aman untuk ditinjau konselor.'],
  ['03', 'Ikuti konseling', 'Sesi berlangsung secara online atau tatap muka.'],
  ['04', 'Pantau perkembangan', 'Riwayat, mood check-in, dan tindak lanjut tetap tersedia.'],
]

const faqs = [
  ['Apa itu UniCounsel?', 'UniCounsel adalah ruang layanan konseling yang membantu mahasiswa terhubung dengan konselor ketika membutuhkan tempat aman untuk didengar.'],
  ['Apakah ceritaku akan dianggap berlebihan?', 'Tidak. Apa pun yang sedang kamu rasakan layak dibicarakan. Konselor akan mendengarkan tanpa menghakimi dan membantumu memahami keadaan secara perlahan.'],
  ['Apakah sesi bisa dilakukan secara online?', 'Ya. Mahasiswa dapat memilih sesi online atau tatap muka berdasarkan ketersediaan yang dibuat konselor.'],
  ['Kapan sebaiknya aku mencari bantuan?', 'Kamu boleh mencari bantuan kapan saja, termasuk ketika merasa lelah, kesepian, sulit fokus, kehilangan harapan, atau merasa hidup terlalu berat untuk dijalani sendiri.'],
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-700/70 bg-[#111d35]/95 backdrop-blur">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <UniCounselIcon size={40} />
            <div>
              <p className="text-base font-bold">UniCounsel</p>
              <p className="text-[11px] text-slate-400">Layanan Konseling Kampus</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-300 lg:flex">
            <a href="#tentang" className="transition-colors hover:text-blue-300">Tentang</a>
            <a href="#solusi" className="transition-colors hover:text-blue-300">Layanan</a>
            <a href="#alur" className="transition-colors hover:text-blue-300">Alur</a>
            <a href="#privasi" className="transition-colors hover:text-blue-300">Privasi</a>
            <a href="#faq" className="transition-colors hover:text-blue-300">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white">
              Masuk
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Daftar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
                <Sparkles className="h-3.5 w-3.5" />
                Ruang aman untuk bertumbuh dan didengar
              </div>
              <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Kamu tidak harus menghadapi semuanya sendirian.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Ketika kuliah, hubungan, keluarga, atau pikiranmu terasa terlalu berat, kamu boleh berhenti sejenak dan mencari bantuan.
                UniCounsel membantumu bertemu konselor yang siap mendengar tanpa menghakimi.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-3 text-sm font-bold text-white hover:bg-blue-400">
                  Mulai sebagai Mahasiswa <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#tentang" className="rounded-lg border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                  Pelajari Layanan
                </a>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Akses berdasarkan peran</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Sesi online dan tatap muka</span>
                <span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-emerald-400" /> Privasi terjaga</span>
              </div>
            </div>

            <div className="relative">
              <div className="border border-white/15 bg-white/5 p-5 shadow-2xl backdrop-blur sm:p-7">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase text-blue-300">Alur layanan hari ini</p>
                    <p className="mt-1 text-xl font-bold">Dukungan hadir saat dibutuhkan</p>
                  </div>
                  <HeartPulse className="h-8 w-8 text-blue-400" />
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    ['Cari Konselor', 'Pilih berdasarkan kebutuhan dan spesialisasi', '01'],
                    ['Pilih Jadwal', 'Lihat slot yang benar-benar tersedia', '02'],
                    ['Ikuti Sesi', 'Online atau bertemu langsung di kampus', '03'],
                  ].map(([title, desc, number]) => (
                    <div key={title} className="flex items-start gap-4 border border-white/10 bg-white/[0.04] p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-blue-500 text-xs font-bold">{number}</span>
                      <div>
                        <p className="text-sm font-bold">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">{desc}</p>
                      </div>
                      <CheckCircle2 className="ml-auto mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-center">
                  {[['2', 'Mahasiswa & konselor'], ['1', 'Ruang aman'], ['24/7', 'Akses portal']].map(([value, label]) => (
                    <div key={label}>
                      <p className="text-xl font-bold text-blue-300">{value}</p>
                      <p className="mt-1 text-[10px] uppercase text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tentang" className="scroll-mt-24 border-b border-slate-700/70 bg-[#111d35] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Mengapa UniCounsel hadir?</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Kadang hidup memang terasa berat.</h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Kamu mungkin terlihat baik-baik saja dari luar, tetapi sedang berjuang keras di dalam. Kamu tidak perlu membuktikan bahwa
                masalahmu cukup besar untuk mendapatkan bantuan. Perasaanmu penting, dan ada orang yang bersedia mendengarkan.
              </p>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden border border-slate-700 bg-slate-700 md:grid-cols-2 lg:grid-cols-4">
              {challenges.map(({ title, description, icon: Icon }) => (
                <article key={title} className="bg-[#14213b] p-6">
                  <Icon className="h-6 w-6 text-blue-400" />
                  <h3 className="mt-5 text-base font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="solusi" className="scroll-mt-24 bg-[#0f172a] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Solusi dari UniCounsel</p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Mulai dari satu percakapan yang aman.</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Kamu tidak harus langsung mengetahui semua jawabannya. Konselor akan menemanimu memahami apa yang terjadi dan mencari
                  langkah kecil yang mungkin dilakukan hari ini.
                </p>
                <div className="mt-8 border-l-2 border-primary pl-5">
                  <p className="text-sm font-bold text-white">Kamu tidak hanya diminta untuk “kuat”.</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Konselor hadir untuk mendengar, memahami, dan berjalan bersamamu. Meminta bantuan adalah bentuk kepedulian terhadap diri sendiri.
                  </p>
                </div>
              </div>
              <div className="grid gap-px border border-slate-700 bg-slate-700 sm:grid-cols-2">
                {solutions.map(({ title, description, icon: Icon, number }) => (
                  <article key={title} className="bg-[#14213b] p-6 sm:p-7">
                    <div className="flex items-center justify-between">
                      <Icon className="h-7 w-7 text-blue-400" />
                      <span className="text-xs font-bold text-slate-500">{number}</span>
                    </div>
                    <h3 className="mt-8 text-lg font-bold">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="alur" className="scroll-mt-24 border-y border-blue-400/20 bg-[#18366c] py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Alur penggunaan</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Dari mencari bantuan sampai tindak lanjut.</h2>
            </div>
            <div className="mt-12 grid gap-px bg-blue-300/20 lg:grid-cols-4">
              {flowSteps.map(([number, title, description]) => (
                <div key={number} className="bg-[#18366c] p-6 lg:min-h-56">
                  <p className="text-3xl font-extrabold text-blue-300">{number}</p>
                  <h3 className="mt-8 text-lg font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-blue-100/80">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0f172a] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Kolaborasi layanan</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Mahasiswa didengar, konselor mendampingi.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Konseling bukan tentang memberi ceramah atau menyuruhmu segera kuat. Ini adalah ruang untuk memahami perasaan dan mencari jalan bersama.
              </p>
            </div>
            <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
              {actors.map(({ title, description, icon: Icon, color }) => (
                <article key={title} className="border border-slate-700 bg-[#14213b] p-7 shadow-sm">
                  <div className={`flex h-12 w-12 items-center justify-center border ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="privasi" className="scroll-mt-24 border-y border-slate-700 bg-[#111d35] py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="border border-blue-400/20 bg-[#0b1222] p-7 text-white sm:p-10">
              <ShieldCheck className="h-10 w-10 text-blue-400" />
              <h2 className="mt-8 text-3xl font-bold">Privasi bukan fitur tambahan. Ia bagian dari layanan.</h2>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                Ceritamu adalah hal pribadi. UniCounsel membatasi akses layanan sehingga informasi dan catatan konseling hanya dapat dilihat oleh pihak yang berwenang.
              </p>
            </div>
            <div className="flex flex-col justify-center">
              {[
                ['Akses terbatas', 'Mahasiswa dan konselor hanya melihat informasi yang relevan dengan proses konseling.'],
                ['Ruang untuk bercerita', 'Kamu dapat memulai percakapan tanpa harus takut dinilai atau dianggap berlebihan.'],
                ['Komunikasi terarah', 'Percakapan layanan berlangsung melalui akun yang terhubung dengan sesi.'],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-4 border-b border-slate-700 py-5 first:pt-0">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <h3 className="text-base font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 bg-[#0f172a] py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Pertanyaan umum</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Hal yang perlu kamu ketahui</h2>
            </div>
            <div className="mt-10 border-t border-slate-700">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group border-b border-slate-700 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold">
                    {question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="max-w-2xl">
              <BookOpenCheck className="h-8 w-8 text-blue-400" />
              <h2 className="mt-5 text-3xl font-bold">Kamu layak mendapat bantuan.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Tidak apa-apa jika hari ini terasa berat. Mulailah dengan satu langkah kecil: berbicara kepada seseorang yang siap mendengar.
              </p>
              <p className="mt-3 text-xs leading-6 text-amber-200">
                Jika kamu merasa tidak aman atau memiliki keinginan menyakiti diri, segera hubungi layanan darurat setempat atau orang terpercaya yang dapat mendampingimu sekarang.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-3 text-sm font-bold hover:bg-blue-400">
                Daftar Mahasiswa <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="rounded-lg border border-white/20 px-5 py-3 text-sm font-bold hover:bg-white/10">
                Masuk ke Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-700 bg-[#111d35]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-xs text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <UniCounselIcon size={34} />
            <div>
              <p className="font-bold text-white">UniCounsel</p>
              <p>Platform layanan konseling kampus terpadu.</p>
            </div>
          </div>
          <p>© 2026 UniCounsel. Dibangun untuk mendukung kesejahteraan mahasiswa.</p>
        </div>
      </footer>
    </div>
  )
}
