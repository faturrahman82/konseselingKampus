import { useEffect, useState, useRef } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import {
  User, Mail, Briefcase, FileText, Save,
  Loader2, CheckCircle2, AlertCircle, Camera,
} from 'lucide-react'
import { cn, getAvatarSrc } from '@/lib/utils'
import api from '@/api/axios'

interface CounselorProfile {
  fullName: string
  email: string
  specialization: string
  bioDescription: string
  avatarUrl?: string
}

// ── Toast ──
const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
  <div className={cn(
    'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium',
    type === 'success'
      ? 'bg-green-50 border border-green-200 text-green-800'
      : 'bg-red-50 border border-red-200 text-red-800'
  )}>
    {type === 'success'
      ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
      : <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
    }
    {message}
  </div>
)

export default function KonselorProfil() {
  const [profile, setProfile] = useState<CounselorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [fullName, setFullName] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [bioDescription, setBioDescription] = useState('')

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get('/counselors/me')
      const d = res.data.data
      const p: CounselorProfile = {
        fullName: d.fullName || '',
        email: d.user?.email || '',
        specialization: d.specialization || '',
        bioDescription: d.bioDescription || '',
        avatarUrl: getAvatarSrc(d.avatarUrl) ?? undefined,
      }
      setProfile(p)
      setFullName(p.fullName)
      setSpecialization(p.specialization)
      setBioDescription(p.bioDescription)
    } catch {
      setProfile({ fullName: '', email: '', specialization: '', bioDescription: '' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [])

  const handleSave = async () => {
    if (!fullName.trim()) { showToast('Nama lengkap wajib diisi.', 'error'); return }
    setSaving(true)
    try {
      await api.patch('/counselors/me', { fullName, specialization, bioDescription })
      showToast('Profil berhasil disimpan!', 'success')
      setProfile(prev => prev ? { ...prev, fullName, specialization, bioDescription } : prev)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan profil.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      const res = await api.post('/counselors/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = res.data.data.avatarUrl
      setProfile(prev => prev ? { ...prev, avatarUrl: getAvatarSrc(url) ?? undefined } : prev)
      showToast('Foto profil berhasil diperbarui!', 'success')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal upload foto.', 'error')
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const initials = fullName
    .split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'CO'

  if (loading) return (
    <DashboardLayout role="counselor">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout role="counselor">
      {toast && <Toast {...toast} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profil Konselor</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola informasi profesional Anda yang terlihat oleh mahasiswa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        {/* ── Left: Avatar Card ── */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center text-center">
            {/* Avatar — click to upload */}
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div
              onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full mb-4 cursor-pointer group"
            >
              {profile?.avatarUrl
                ? <img src={profile.avatarUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                : <div className="w-24 h-24 rounded-full bg-accent/60 flex items-center justify-center text-3xl font-bold text-primary border-4 border-white shadow-md">{initials}</div>
              }
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingAvatar
                  ? <Loader2 className="h-6 w-6 text-white animate-spin" />
                  : <Camera className="h-6 w-6 text-white" />
                }
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Klik foto untuk mengubah</p>

            <h2 className="text-lg font-bold text-foreground">{fullName || 'Counselor'}</h2>
            {specialization && (
              <p className="text-sm font-medium text-primary mt-0.5">{specialization}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">{profile?.email}</p>
          </div>
        </div>

        {/* ── Right: Edit Form ── */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <h3 className="text-base font-semibold text-foreground mb-1">Detail Profesional</h3>
          <p className="text-sm text-muted-foreground mb-6">Perbarui informasi kontak dan bio Anda.</p>

          <div className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nama Lengkap (dengan Gelar)</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Dr. Emily Chen"
                  className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Email (readonly) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={profile?.email || ''}
                  readOnly
                  className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-input bg-secondary/40 text-muted-foreground cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Hubungi IT universitas untuk mengubah email resmi Anda.
              </p>
            </div>

            {/* Specialization */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Spesialisasi</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  placeholder="Contoh: General Counseling"
                  className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Professional Bio */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Bio Profesional</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <textarea
                  rows={4}
                  value={bioDescription}
                  onChange={e => setBioDescription(e.target.value)}
                  placeholder="Ceritakan pengalaman dan keahlian profesional Anda..."
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving
                ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</>
                : <><Save className="h-4 w-4" />Simpan Perubahan</>
              }
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
