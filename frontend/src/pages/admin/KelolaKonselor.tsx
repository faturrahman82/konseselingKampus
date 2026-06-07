import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Plus, Search, Pencil, Trash2, Loader2, X, AlertCircle, CheckCircle2, Copy } from 'lucide-react'
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

interface NewCounselorCredentials {
  fullName: string
  email: string
  username: string
  password: string
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
  onSaved: (credentials: NewCounselorCredentials) => void
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
      onSaved({
        fullName: fullName.trim(),
        email: email.trim(),
        username,
        password,
      })
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
            Password awal akan dibuat otomatis dan ditampilkan sekali setelah akun berhasil dibuat.
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
const EditModal = ({
  counselor,
  onClose,
  onSaved,
}: {
  counselor: Counselor
  onClose: () => void
  onSaved: () => void
}) => {
  const [fullName, setFullName] = useState(counselor.fullName)
  const [specialization, setSpecialization] = useState(counselor.specialization)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async () => {
    if (!fullName.trim() || !specialization.trim()) {
      setErr('Nama lengkap dan spesialisasi wajib diisi.')
      return
    }

    setSaving(true)
    setErr('')
    try {
      await api.patch(`/admin/counselors/${counselor.id}`, {
        fullName: fullName.trim(),
        specialization: specialization.trim(),
      })
      onSaved()
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Gagal memperbarui konselor.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Edit Konselor</h2>
            <p className="text-xs text-primary mt-0.5">Perbarui data konselor yang terdaftar.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full h-11 px-4 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Spesialisasi</label>
            <input
              type="text"
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              className="w-full h-11 px-4 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
            <p className="text-xs font-medium text-foreground">Email akun</p>
            <p className="text-xs text-muted-foreground mt-1">{counselor.email}</p>
          </div>
          {err && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{err}
            </p>
          )}
        </div>

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
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</> : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}

const DeleteModal = ({
  counselor,
  deleting,
  onClose,
  onConfirm,
}: {
  counselor: Counselor
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border">
      <div className="flex items-start gap-4 p-6">
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <Trash2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-foreground">Hapus Konselor?</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Data konselor <span className="font-semibold text-foreground">{counselor.fullName}</span> akan dihapus dari sistem. Aksi ini tidak dapat dibatalkan.
          </p>
        </div>
      </div>

      <div className="flex gap-3 p-6 pt-0">
        <button
          onClick={onClose}
          disabled={deleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors disabled:opacity-60"
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {deleting ? <><Loader2 className="h-4 w-4 animate-spin" />Menghapus...</> : 'Hapus Konselor'}
        </button>
      </div>
    </div>
  </div>
)

const CredentialsModal = ({
  credentials,
  copied,
  onCopy,
  onClose,
}: {
  credentials: NewCounselorCredentials
  copied: boolean
  onCopy: () => void
  onClose: () => void
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h2 className="text-base font-bold text-foreground">Akun Konselor Berhasil Dibuat</h2>
          <p className="text-xs text-primary mt-0.5">Simpan kredensial sementara sebelum modal ditutup.</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Password hanya ditampilkan sekali. Setelah modal ini ditutup, admin tidak dapat melihat password ini lagi.
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Nama Konselor</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{credentials.fullName}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Email</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{credentials.email}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Username</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{credentials.username}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Password Sementara</p>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground">{credentials.password}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 p-6 pt-0">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors"
        >
          Tutup
        </button>
        <button
          onClick={onCopy}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Tersalin' : 'Salin Akun'}
        </button>
      </div>
    </div>
  </div>
)

export default function KelolaKonselor() {
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Counselor | null>(null)
  const [newCredentials, setNewCredentials] = useState<NewCounselorCredentials | null>(null)
  const [credentialsCopied, setCredentialsCopied] = useState(false)
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

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(deleteTarget.id)
    try {
      await api.delete(`/admin/counselors/${deleteTarget.id}`)
      showToast(`${deleteTarget.fullName} berhasil dihapus.`, 'success')
      setDeleteTarget(null)
      await fetch()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus konselor.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleCopyCredentials = async () => {
    if (!newCredentials) return

    const text = [
      `Nama: ${newCredentials.fullName}`,
      `Email: ${newCredentials.email}`,
      `Username: ${newCredentials.username}`,
      `Password sementara: ${newCredentials.password}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCredentialsCopied(true)
      setTimeout(() => setCredentialsCopied(false), 2000)
    } catch {
      showToast('Gagal menyalin kredensial.', 'error')
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
                          onClick={() => setEditingCounselor(c)}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                          title="Edit konselor"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
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
          onSaved={(credentials) => {
            setShowModal(false)
            setNewCredentials(credentials)
            setCredentialsCopied(false)
            showToast('Konselor baru berhasil ditambahkan!', 'success')
            fetch()
          }}
        />
      )}

      {editingCounselor && (
        <EditModal
          counselor={editingCounselor}
          onClose={() => setEditingCounselor(null)}
          onSaved={() => {
            setEditingCounselor(null)
            showToast('Data konselor berhasil diperbarui.', 'success')
            fetch()
          }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          counselor={deleteTarget}
          deleting={deleting === deleteTarget.id}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {newCredentials && (
        <CredentialsModal
          credentials={newCredentials}
          copied={credentialsCopied}
          onCopy={handleCopyCredentials}
          onClose={() => {
            setNewCredentials(null)
            setCredentialsCopied(false)
          }}
        />
      )}
    </DashboardLayout>
  )
}
