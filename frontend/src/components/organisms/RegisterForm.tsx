import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { User, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '../atoms/Button'
import { cn } from '@/lib/utils'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),  // FIX: fullName (sesuai BE)
  username: z.string().min(3, 'Username minimal 3 karakter').regex(/^[a-zA-Z0-9_]+$/, 'Hanya huruf, angka, dan underscore'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
})

export type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => Promise<void>
  isLoading?: boolean
}

const fields = [
  {
    name: 'fullName' as const,  // FIX: fullName
    label: 'Nama Lengkap',
    placeholder: 'Masukkan nama lengkap Anda',
    icon: User,
    type: 'text',
  },
  {
    name: 'username' as const,
    label: 'Username',
    placeholder: 'Pilih username unik Anda',
    icon: User,
    type: 'text',
  },
  {
    name: 'email' as const,
    label: 'Email',
    placeholder: 'demo@universitas.ac.id',
    icon: Mail,
    type: 'email',
  },
  {
    name: 'password' as const,
    label: 'Kata Sandi',
    placeholder: 'Minimal 8 karakter',
    icon: Lock,
    type: 'password',
  },
  {
    name: 'confirmPassword' as const,
    label: 'Konfirmasi Kata Sandi',
    placeholder: 'Ulangi kata sandi Anda',
    icon: Lock,
    type: 'password',
  },
]

export const RegisterForm = ({ onSubmit, isLoading }: RegisterFormProps) => {
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    confirmPassword: false,
  })
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field) => {
        const Icon = field.icon
        const error = errors[field.name]
        const isPassword = field.type === 'password'
        const isVisible = isPassword
          ? visiblePasswords[field.name as 'password' | 'confirmPassword']
          : false
        return (
          <div key={field.name} className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">{field.label}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type={isPassword && isVisible ? 'text' : field.type}
                placeholder={field.placeholder}
                {...register(field.name)}
                className={cn(
                  'w-full h-10 pl-9 text-sm rounded-md border bg-background',
                  isPassword ? 'pr-10' : 'pr-3',
                  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors',
                  error ? 'border-destructive' : 'border-input'
                )}
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setVisiblePasswords(current => ({
                    ...current,
                    [field.name]: !isVisible,
                  }))}
                  className="absolute inset-y-0 right-2 flex items-center justify-center p-1.5 rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={isVisible ? `Sembunyikan ${field.label.toLowerCase()}` : `Tampilkan ${field.label.toLowerCase()}`}
                  title={isVisible ? `Sembunyikan ${field.label.toLowerCase()}` : `Tampilkan ${field.label.toLowerCase()}`}
                >
                  {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            </div>
            {error && <p className="text-xs text-destructive">{error.message}</p>}
          </div>
        )
      })}

      <Button
        type="submit"
        className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Mendaftar...
          </>
        ) : (
          <>
            Daftar Sekarang
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
