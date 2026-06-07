import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

// UniCounsel Logo Icon SVG
export const UniCounselIcon = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="hsl(225, 64%, 33%)" />
    {/* Shield shape */}
    <path
      d="M24 11L14 15.5V24C14 29.8 18.3 35.2 24 37C29.7 35.2 34 29.8 34 24V15.5L24 11Z"
      fill="white"
      fillOpacity="0.15"
      stroke="white"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Heart inside */}
    <path
      d="M24 30C24 30 17 25.5 17 20.5C17 18.6 18.6 17 20.5 17C21.7 17 22.8 17.6 23.5 18.5C23.9 17.8 24.6 17.3 25.4 17.1C25.8 17 26.2 17 26.5 17C28.4 17 30 18.6 30 20.5C30 25.5 24 30 24 30Z"
      fill="white"
    />
  </svg>
)

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  footer?: React.ReactNode
  showHomeLink?: boolean
}

export const AuthLayout = ({ children, title, subtitle, footer, showHomeLink = false }: AuthLayoutProps) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background p-4 py-12">
      {showHomeLink && (
        <Link
          to="/"
          className="absolute left-4 top-4 sm:left-8 sm:top-8 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Kembali ke Beranda</span>
          <span className="sm:hidden">Beranda</span>
        </Link>
      )}
      {/* Logo + Brand */}
      <div className="flex flex-col items-center mb-6 gap-3">
        <UniCounselIcon size={56} />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">UniCounsel</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sistem Pemesanan Konseling dan Konsultasi Universitas
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-card rounded-xl shadow-sm border border-border p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {children}
      </div>

      {/* Below card footer */}
      {footer && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          {footer}
        </div>
      )}

      {/* Copyright */}
      <p className="mt-8 text-xs text-muted-foreground text-center">
        © 2026 Pusat Kesejahteraan Universitas. Hak Cipta Dilindungi.
      </p>
    </div>
  )
}
