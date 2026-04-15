import { useEffect, useState, useRef } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { User, Mail, Phone, IdCard, GraduationCap, Save, Loader2, CheckCircle2, AlertCircle, Camera } from 'lucide-react'
import { cn, getAvatarSrc } from '@/lib/utils'
import api from '@/api/axios'
import { useAuthStore } from '@/store/useAuthStore'

interface StudentProfile {
  fullName: string
  email: string
  username: string
  nim?: string
  major?: string
  faculty?: string
  university?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  avatarUrl?: string
}

// ── Toast notification ──
const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
  <div className={cn(
    'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all',
    type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
  )}>
    {type === 'success'
      ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
      : <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
    }
    {message}
  </div>
)

export default function MahasiswaProfil() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [fullName, setFullName] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      // GET /api/auth/me - ambil profil terkini
      const res = await api.get('/auth/me')
      const data = res.data.data
      const p: StudentProfile = {
        fullName: data.profile?.fullName || data.username || '',
        email: data.email,
        username: data.username,
        nim: data.profile?.nim,
        major: data.profile?.major,
        faculty: data.profile?.faculty,
        university: data.profile?.university,
        emergencyContactName: data.profile?.emergencyContactName || '',
        emergencyContactPhone: data.profile?.emergencyContactPhone || '',
        avatarUrl: data.profile?.avatarUrl ? getAvatarSrc(data.profile.avatarUrl) ?? undefined : undefined,
      }
      setProfile(p)
      setFullName(p.fullName)
      setEmergencyContactName(p.emergencyContactName || '')
      setEmergencyContactPhone(p.emergencyContactPhone || '')
    } catch {
      // Fallback dari auth store jika /me tidak tersedia
      setProfile({
        fullName: user?.name || user?.username || '',
        email: user?.email || '',
        username: user?.username || '',
      })
      setFullName(user?.name || user?.username || '')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [])

  const handleSave = async () => {
    if (!fullName.trim()) { showToast('Nama lengkap wajib diisi.', 'error'); return }
    setSaving(true)
    try {
      await api.patch('/students/profile', {
        fullName,
        emergencyContactName,
        emergencyContactPhone,
      })
      showToast('Profil berhasil disimpan!', 'success')
      setProfile(prev => prev ? { ...prev, fullName, emergencyContactName, emergencyContactPhone } : prev)
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
      const res = await api.post('/students/avatar', formData, {
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

  const initials = profile?.fullName
    ?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'S'

  if (loading) return (
    <DashboardLayout role="student">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout role="student">
      {toast && <Toast {...toast} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profil Saya</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola informasi pribadi dan preferensi akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        {/* ── Left: Profile Card ── */}
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

            <h2 className="text-lg font-bold text-foreground">{profile?.fullName}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{profile?.email}</p>

            {/* Academic Info */}
            {(profile?.nim || profile?.major) && (
              <div className="w-full mt-5 space-y-2 text-left">
                <div className="border-t border-border pt-4" />
                {profile.nim && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <IdCard className="h-3.5 w-3.5" />NIM
                    </span>
                    <span className="font-medium text-foreground">{profile.nim}</span>
                  </div>
                )}
                {profile.major && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5" />Jurusan
                    </span>
                    <span className="font-medium text-foreground">{profile.major}</span>
                  </div>
                )}
                {profile.faculty && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5" />Fakultas
                    </span>
                    <span className="font-medium text-foreground">{profile.faculty}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Edit Form ── */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <h3 className="text-base font-semibold text-foreground mb-1">Informasi Pribadi</h3>
          <p className="text-sm text-muted-foreground mb-6">Perbarui informasi kontak dan data dasar Anda.</p>

          <div className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
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
                Hubungi IT universitas untuk mengubah alamat email Anda.
              </p>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Kontak Darurat</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Nama kontak darurat"
                    value={emergencyContactName}
                    onChange={e => setEmergencyContactName(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder:text-muted-foreground"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="No. telepon"
                    value={emergencyContactPhone}
                    onChange={e => setEmergencyContactPhone(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Contoh: Budi Santoso (Ayah) - 081234567890
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-2">
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
      </div>
    </DashboardLayout>
  )
}
