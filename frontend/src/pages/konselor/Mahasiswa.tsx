import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Search, UserCircle, MessageSquare, Filter, Users, AlertCircle, X, GraduationCap, BookOpen, Hash, PhoneCall, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'

interface Student {
  id: string
  userId?: string
  fullName: string
  nim?: string
  major?: string
  faculty?: string
  university?: string
  phoneNumber?: string
  totalSessions: number
  lastSessionStatus?: string
  wellbeingScore?: number
}

// ── Profil Modal ──
function ProfileModal({ student, onClose }: { student: Student; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Profil Mahasiswa</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Avatar + Nama */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {student.fullName?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-semibold text-foreground">{student.fullName}</p>
              <p className="text-xs text-muted-foreground">{student.nim || 'NIM tidak diketahui'}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="space-y-3 text-sm">
            {student.faculty && (
              <div className="flex items-start gap-3">
                <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Fakultas</p>
                  <p className="font-medium text-foreground">{student.faculty}</p>
                </div>
              </div>
            )}
            {student.major && (
              <div className="flex items-start gap-3">
                <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Jurusan</p>
                  <p className="font-medium text-foreground">{student.major}</p>
                </div>
              </div>
            )}
            {student.university && (
              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Universitas</p>
                  <p className="font-medium text-foreground">{student.university}</p>
                </div>
              </div>
            )}
            {student.phoneNumber && (
              <div className="flex items-start gap-3">
                <PhoneCall className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Telepon</p>
                  <p className="font-medium text-foreground">{student.phoneNumber}</p>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-foreground">{student.totalSessions ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total Sesi</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-foreground">{student.wellbeingScore ?? '-'}</p>
              <p className="text-xs text-muted-foreground">Skor Wellbeing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) return <span className="text-xs text-muted-foreground">-</span>
  const isActive = status === 'APPROVED' || status === 'PENDING'
  return (
    <span className={cn(
      'inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full',
      isActive ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', isActive ? 'bg-green-500' : 'bg-blue-500')} />
      {isActive ? 'Aktif' : 'Selesai'}
    </span>
  )
}

export default function KonselorMahasiswa() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [profileStudent, setProfileStudent] = useState<Student | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/appointments/my-students')
      .then(res => setStudents(res.data.data || []))
      .catch(err => setError(err.response?.data?.message || 'Gagal memuat daftar mahasiswa.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter(s => {
    const matchSearch =
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      (s.nim || '').includes(search) ||
      (s.major || '').toLowerCase().includes(search.toLowerCase())

    const matchFilter =
      filterStatus === 'Semua' ||
      (filterStatus === 'Aktif' && (s.lastSessionStatus === 'APPROVED' || s.lastSessionStatus === 'PENDING')) ||
      (filterStatus === 'Selesai' && s.lastSessionStatus === 'DONE')

    return matchSearch && matchFilter
  })

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset page to 1 if search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterStatus])

  return (
    <DashboardLayout role="counselor">
      {/* Profile Modal */}
      {profileStudent && (
        <ProfileModal student={profileStudent} onClose={() => setProfileStudent(null)} />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Daftar Mahasiswa</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mahasiswa yang pernah melakukan sesi konseling dengan Anda.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, NIM, atau jurusan..."
            className="w-full pl-10 pr-4 h-10 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2">
          <Filter className="h-4 w-4 text-muted-foreground self-center shrink-0" />
          {['Semua', 'Aktif', 'Selesai'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                filterStatus === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-secondary'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <div className="flex justify-between pb-3 border-b border-border">
             <Skeleton className="h-4 w-1/4" />
             <Skeleton className="h-4 w-1/4" />
             <Skeleton className="h-4 w-1/4" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4 opacity-50" />
              </div>
              <Skeleton className="h-8 w-8 ml-auto rounded-md" />
            </div>
          ))}
        </div>
      )}
      {error && !loading && (
        <div className="flex items-center gap-2 text-red-600 text-sm p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Tabel */}
      {!loading && !error && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mahasiswa</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">NIM</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jurusan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Sesi</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map(s => (
                <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {s.fullName?.charAt(0) || '?'}
                      </div>
                      <span className="font-medium text-foreground">{s.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{s.nim || '-'}</td>
                  <td className="px-5 py-4 text-muted-foreground">{s.major || '-'}</td>
                  <td className="px-5 py-4 text-foreground font-medium">{s.totalSessions ?? '-'}</td>
                  <td className="px-5 py-4"><StatusBadge status={s.lastSessionStatus} /></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setProfileStudent(s)}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <UserCircle className="h-3.5 w-3.5" />
                        Profil
                      </button>
                      <button
                        onClick={() => navigate('/konselor/pesan')}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Pesan
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && !loading && (
            <div className="py-16 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {students.length === 0
                  ? 'Belum ada mahasiswa yang pernah melakukan sesi konseling dengan Anda.'
                  : 'Tidak ada mahasiswa yang cocok dengan pencarian.'}
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-secondary/20">
              <span className="text-xs text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
