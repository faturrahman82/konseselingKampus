import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Plus, Search, Pencil, Trash2, Loader2, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'

interface Counselor {
  id: string
  fullName: string
  email: string
  specialization: string
  status: string
  caseLoad: number
}

// ── Toast ──
const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
  <div className={cn(
    'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium',
    type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
  )}>
    {type === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />}
    {message}
  </div>
)

// ── Add Counselor Modal ──
const AddModal = ({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !specialization.trim()) {
      setErr('Semua field wajib diisi.'); return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErr('Format email tidak valid.'); return
    }
    setSaving(true); setErr('')
    try {
      // Generate username from email prefix
      const username = email.split('@')[0]
      const password = 'Konselor@' + Math.random().toString(36).slice(-6)
      await api.post('/admin/counselors', {
        fullName, email, username, password, specialization,
      })
      onSaved()
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Gagal menambah konselor.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Tambah Konselor Baru</h2>
            <p className="text-xs text-primary mt-0.5">Daftarkan konselor baru ke dalam sistem universitas.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nama Lengkap</label>
            <input
              type="text"
              placeholder="Dr. Jane Doe"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full h-11 px-4 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Alamat Email</label>
            <input
              type="email"
              placeholder="jane.doe@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-11 px-4 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Spesialisasi</label>
            <input
              type="text"
              placeholder="misal: Stres Akademik"
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              className="w-full h-11 px-4 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>
          {err && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{err}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            💡 Password awal akan di-generate otomatis dan dapat diubah konselor setelah login pertama.
          </p>
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
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</> : 'Simpan Konselor'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──
export default function KelolaKonselor() {
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetch = async () => {
    try {
      setLoading(true)
      const res = await api.get('/dashboard/admin')
      setCounselors(res.data.data?.counselorDirectory || [])
    } catch {
      setCounselors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus ${name}?`)) return
    setDeleting(id)
    try {
      await api.delete(`/admin/counselors/${id}`)
      showToast(`${name} berhasil dihapus.`, 'success')
      await fetch()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus konselor.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = counselors.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.specialization.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout role="admin">
      {toast && <Toast {...toast} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kelola Konselor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tambah, ubah, atau hapus konselor dari sistem.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Konselor
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Search + Count */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari konselor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 pl-9 pr-4 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-56"
            />
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-primary text-primary-foreground rounded-full">
            {filtered.length} Total
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Spesialisasi</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
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
                        <span className="font-medium text-foreground">{c.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">{c.specialization}</td>
                    <td className="px-5 py-4 text-muted-foreground">{c.email}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                          title="Edit konselor"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.fullName)}
                          disabled={deleting === c.id}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive disabled:opacity-50"
                          title="Hapus konselor"
                        >
                          {deleting === c.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    Tidak ada konselor ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false)
            showToast('Konselor baru berhasil ditambahkan!', 'success')
            fetch()
          }}
        />
      )}
    </DashboardLayout>
  )
}
