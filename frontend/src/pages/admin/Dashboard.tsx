import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Users, UserCheck, Activity, Loader2, AlertCircle, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'
import { useNavigate } from 'react-router-dom'

interface CounselorEntry {
  id: string
  fullName: string
  email: string
  specialization: string
  status: string
  caseLoad: number
}

interface DashboardData {
  globalStats: {
    totalStudents: number
    activeCounselors: number
    systemHealth: string
  }
  counselorDirectory: CounselorEntry[]
}

const StatCard = ({
  icon: Icon, label, value, sub, iconClass, bgClass,
}: {
  icon: any; label: string; value: string | number; sub?: string; iconClass: string; bgClass: string
}) => (
  <div className={cn('rounded-xl border border-border p-6', bgClass)}>
    <p className="text-sm text-muted-foreground mb-3">{label}</p>
    <div className="flex items-end gap-3">
      <Icon className={cn('h-6 w-6 mb-0.5', iconClass)} />
      <span className="text-4xl font-bold text-foreground">{value}</span>
    </div>
    {sub && <p className="text-xs text-muted-foreground mt-2">{sub}</p>}
  </div>
)

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(res => setData(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Gagal memuat data.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = (data?.counselorDirectory || []).filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.specialization.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  )

  if (error) return (
    <DashboardLayout role="admin">
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <AlertCircle className="h-8 w-8 text-destructive/50" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout role="admin">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel Kontrol Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola pengguna, peran, dan konfigurasi sistem.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/konselor')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Users className="h-4 w-4" />
          + Kelola Konselor
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="Total Mahasiswa"
          value={data?.globalStats.totalStudents ?? 0}
          bgClass="bg-card"
          iconClass="text-blue-500"
        />
        <StatCard
          icon={UserCheck}
          label="Konselor Aktif"
          value={data?.globalStats.activeCounselors ?? 0}
          bgClass="bg-card"
          iconClass="text-green-500"
        />
        <StatCard
          icon={Activity}
          label="Kesehatan Sistem"
          value={data?.globalStats.systemHealth ?? '99.9%'}
          sub="Semua sistem operasional"
          bgClass="bg-card"
          iconClass="text-teal-500"
        />
      </div>

      {/* Counselor Directory Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Direktori Konselor</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari konselor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 pl-3 pr-8 text-xs rounded-lg border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-44"
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Spesialisasi</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sesi Aktif</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(c => {
              const initials = c.fullName.split(' ').map(n => n[0]).slice(0, 1).join('').toUpperCase()
              return (
                <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.fullName}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{c.specialization}</td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                      c.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', c.status === 'Aktif' ? 'bg-green-500' : 'bg-red-500')} />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{c.caseLoad} sesi</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => navigate('/admin/konselor')}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  Tidak ada konselor ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
