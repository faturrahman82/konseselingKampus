import api from '@/api/axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, GraduationCap, BookOpen, Hash, Calendar, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// FIX: field names sesuai backend (university, faculty, major, nim, semester, phoneNumber)
const fields = [
  {
    name: 'university',     // FIX: was 'universitas'
    label: 'Universitas',
    placeholder: 'Contoh: Universitas Indonesia',
    icon: Building2,
    type: 'text',
    colSpan: 'full',
  },
  {
    name: 'faculty',        // FIX: was 'fakultas'
    label: 'Fakultas',
    placeholder: 'Contoh: Ilmu Komputer',
    icon: Building2,
    type: 'text',
    colSpan: 'half',
  },
  {
    name: 'major',          // FIX: was 'jurusan'
    label: 'Program Studi / Jurusan',
    placeholder: 'Contoh: Sistem Informasi',
    icon: BookOpen,
    type: 'text',
    colSpan: 'half',
  },
  {
    name: 'nim',
    label: 'Nomor Induk Mahasiswa (NIM)',
    placeholder: 'Masukkan NIM Anda',
    icon: Hash,
    type: 'text',
    colSpan: 'half',
  },
  {
    name: 'semester',
    label: 'Semester Saat Ini',
    placeholder: 'Contoh: 5',
    icon: Calendar,
    type: 'number',
    colSpan: 'half',
  },
]

export default function CompleteProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({
    university: '',
    faculty: '',
    major: '',
    nim: '',
    semester: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.university) errs.university = 'Universitas wajib diisi'
    if (!form.faculty) errs.faculty = 'Fakultas wajib diisi'
    if (!form.major) errs.major = 'Jurusan wajib diisi'
    if (!form.nim) errs.nim = 'NIM wajib diisi'
    if (!form.semester) errs.semester = 'Semester wajib diisi'
    return errs
  }

  const handleChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      // FIX: endpoint PATCH /api/auth/complete-profile (bukan /api/profile/complete)
      // Token otomatis dilampirkan oleh interceptor
      await api.patch('/auth/complete-profile', {
        ...form,
        semester: parseInt(form.semester),
      })
      navigate('/mahasiswa/dasbor')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan profil. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-6 h-6 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Lengkapi Profil Anda</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tambahkan informasi akademik untuk melanjutkan ke dasbor
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-card rounded-xl shadow-sm border border-border p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Informasi Akademik</h2>
            <p className="text-xs text-muted-foreground">
              Data ini akan membantu konselor dalam memahami latar belakang Anda.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {fields.map((field) => {
              const Icon = field.icon
              const error = errors[field.name]
              return (
                <div
                  key={field.name}
                  className={cn('space-y-1.5', field.colSpan === 'full' ? 'col-span-2' : 'col-span-1')}
                >
                  <label className="block text-sm font-medium text-foreground">{field.label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={e => handleChange(field.name, e.target.value)}
                      className={cn(
                        'w-full h-10 pl-9 pr-3 text-sm rounded-md border bg-background',
                        'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors',
                        error ? 'border-destructive' : 'border-input'
                      )}
                    />
                  </div>
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>
              )
            })}
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                Simpan & Lanjutkan ke Dasbor
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        © 2026 Pusat Kesejahteraan Universitas. Hak Cipta Dilindungi.
      </p>
    </div>
  )
}
