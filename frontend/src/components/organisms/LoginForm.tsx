import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '../atoms/Button'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>
  isLoading?: boolean
}

export const LoginForm = ({ onSubmit, isLoading }: LoginFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Email Field */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="email"
            placeholder="demo@universitas.ac.id"
            {...register('email')}
            className={cn(
              'w-full h-10 pl-9 pr-3 py-2 text-sm rounded-md border bg-background',
              'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors',
              errors.email ? 'border-destructive' : 'border-input'
            )}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">Kata Sandi</label>
          <Link
            to="/lupa-sandi"
            className="text-xs font-medium text-primary hover:underline"
          >
            Lupa sandi?
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="password"
            placeholder="password123"
            {...register('password')}
            className={cn(
              'w-full h-10 pl-9 pr-3 py-2 text-sm rounded-md border bg-background',
              'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors',
              errors.password ? 'border-destructive' : 'border-input'
            )}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            Masuk
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
