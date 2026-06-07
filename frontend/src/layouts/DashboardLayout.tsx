import { NavLink, useNavigate, Link } from 'react-router-dom'
import { type ReactNode, useState, useRef, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  Bell,
  LogOut,
  Search,
  UserCircle,
  Settings,
  ChevronDown,
  FileText,
  CheckCheck,
  Menu,
  X as XIcon,
  Newspaper,
  SmilePlus,
  Moon,
  Sun,
} from 'lucide-react'
import { useThemeStore } from '@/store/useThemeStore'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/lib/utils'
import { UniCounselIcon } from './AuthLayout'
import api from '@/api/axios'
import { queryKeys } from '@/api/queryKeys'
import { getSocket } from '@/api/socket'
import ChatBot from '@/components/ChatBot'

// ---- Nav Config ----
const konselorNav = [
  { to: '/konselor/dasbor', icon: LayoutDashboard, label: 'Dasbor' },
  { to: '/konselor/jadwal', icon: Calendar, label: 'Jadwal' },
  { to: '/konselor/mahasiswa', icon: Users, label: 'Mahasiswa' },
  { to: '/konselor/pesan', icon: MessageSquare, label: 'Pesan' },
]

const mahasiswaNav = [
  { to: '/mahasiswa/dasbor', icon: LayoutDashboard, label: 'Dasbor' },
  { to: '/mahasiswa/cari-konselor', icon: Search, label: 'Cari Konselor' },
  { to: '/mahasiswa/jadwal', icon: Calendar, label: 'Jadwal Saya' },
  { to: '/mahasiswa/pesan', icon: MessageSquare, label: 'Pesan' },
  { to: '/mahasiswa/mood', icon: SmilePlus, label: 'Mood Check-in' },
  { to: '/mahasiswa/artikel', icon: Newspaper, label: 'Artikel' },
]

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dasbor' },
  { to: '/admin/konselor', icon: Users, label: 'Konselor' },
  { to: '/admin/laporan', icon: FileText, label: 'Laporan' },
  { to: '/admin/pengaturan', icon: Settings, label: 'Pengaturan' },
]

// ---- Sidebar NavItem ----
const NavItem = ({
  to, icon: Icon, label, onNavigate,
}: {
  to: string; icon: any; label: string; onNavigate?: () => void
}) => (
  <NavLink
    to={to}
    onClick={onNavigate}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-accent text-primary font-semibold'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      )
    }
  >
    <Icon className="h-4 w-4 shrink-0" />
    <span>{label}</span>
  </NavLink>
)

// ---- Notification Bell ----
interface Notif {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

const NotifBell = () => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const { data: notifs = [] } = useQuery<Notif[]>({
    queryKey: queryKeys.notifications,
    queryFn: async () => (await api.get('/notifications')).data.data || [],
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })
  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Notif[]>(queryKeys.notifications, current =>
        current?.map(n => n.id === id ? { ...n, isRead: true } : n) || [])
    },
  })

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onNotification = (notification: Notif) => {
      queryClient.setQueryData<Notif[]>(queryKeys.notifications, current =>
        [notification, ...(current || []).filter(n => n.id !== notification.id)])
    }
    socket.on('notification:new', onNotification)
    return () => { socket.off('notification:new', onNotification) }
  }, [queryClient])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markRead = async (id: string) => {
    await markReadMutation.mutateAsync(id)
  }

  const unread = notifs.filter(n => !n.isRead).length

  const fmtTime = (d: string) => {
    const diff = (Date.now() - new Date(d).getTime()) / 60000
    if (diff < 1) return 'Baru saja'
    if (diff < 60) return `${Math.floor(diff)} menit lalu`
    if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`
    return `${Math.floor(diff / 1440)} hari lalu`
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-destructive rounded-full text-[10px] text-white font-bold flex items-center justify-center px-0.5">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-card rounded-xl border border-border shadow-xl z-40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Notifikasi</p>
            {unread > 0 && (
              <span className="text-xs text-primary">{unread} belum dibaca</span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="h-7 w-7 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">Tidak ada notifikasi.</p>
              </div>
            ) : (
              notifs.map(n => (
                <button
                  key={n.id}
                  onClick={() => { if (!n.isRead) markRead(n.id) }}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-border/50 transition-colors hover:bg-secondary/50',
                    !n.isRead && 'bg-primary/5'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-semibold truncate', !n.isRead ? 'text-foreground' : 'text-muted-foreground')}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{fmtTime(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
          {notifs.length > 0 && (
            <div className="px-4 py-2 border-t border-border">
              <button
                onClick={async () => {
                  await Promise.all(notifs.filter(n => !n.isRead).map(n => markRead(n.id)))
                }}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" /> Tandai semua dibaca
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const ThemeToggle = () => {
  const { theme, setTheme } = useThemeStore()
  
  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(isSystemDark ? 'light' : 'dark')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
      title={theme === 'dark' ? 'Tema Gelap (Klik untuk Sistem)' : theme === 'light' ? 'Tema Terang (Klik untuk Gelap)' : 'Tema Sistem (Klik untuk Terang)'}
    >
      {theme === 'dark' ? <Moon className="h-5 w-5" /> : theme === 'light' ? <Sun className="h-5 w-5" /> : <Sun className="h-5 w-5 opacity-40 mix-blend-luminosity" />}
    </button>
  )
}

// ---- Interface ----
interface DashboardLayoutProps {
  children: ReactNode
  role?: 'counselor' | 'student' | 'admin'
}

export const DashboardLayout = ({ children, role = 'student' }: DashboardLayoutProps) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navItems = role === 'counselor' ? konselorNav : role === 'admin' ? adminNav : mahasiswaNav
  const portalLabel = role === 'counselor' ? 'COUNSELOR PORTAL' : role === 'admin' ? 'ADMIN PORTAL' : 'STUDENT PORTAL'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() || 'U'

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close sidebar on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Profile/Settings base path by role
  const profilePath = role === 'counselor' ? '/konselor/profil' : role === 'admin' ? '/admin' : '/mahasiswa/profil'
  const settingsPath = role === 'counselor' ? '/konselor/pengaturan' : role === 'admin' ? '/admin/pengaturan' : '/mahasiswa/pengaturan'

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── Mobile Backdrop ── */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeSidebar}
      />

      {/* ── Sidebar ── */}
      {/* Desktop: static in flex | Mobile: fixed overlay drawer */}
      <aside className={cn(
        'flex flex-col bg-card border-r border-border z-50 transition-transform duration-300 ease-in-out',
        'fixed inset-y-0 left-0 w-64 shrink-0',
        'md:relative md:translate-x-0 md:flex',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <UniCounselIcon size={36} />
            <span className="text-base font-bold text-foreground tracking-tight">UniCounsel</span>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={closeSidebar}
            className="md:hidden p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
            aria-label="Tutup menu"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {portalLabel}
          </p>
          {navItems.map(item => (
            <NavItem key={item.to} {...item} onNavigate={closeSidebar} />
          ))}
        </nav>

        {/* Bottom: User + Logout */}
        <div className="p-3 border-t border-border space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name || user?.username || 'Pengguna'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 gap-3 shrink-0">

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Buka menu navigasi"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* App name — mobile only (center) */}
          <span className="md:hidden text-sm font-bold text-foreground">UniCounsel</span>

          {/* Spacer — desktop */}
          <div className="hidden md:flex flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Bell */}
            <NotifBell />

            {/* Avatar Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-1.5 rounded-xl p-1 hover:bg-secondary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground select-none">
                  {initials}
                </div>
                <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', dropdownOpen && 'rotate-180')} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-11 w-52 bg-card rounded-xl border border-border shadow-lg z-30 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user?.name || user?.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <Link
                      to={profilePath}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      Profil Saya
                    </Link>
                    <Link
                      to={settingsPath}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Pengaturan
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Kana AI Chatbot — hanya untuk mahasiswa */}
      {role === 'student' && <ChatBot />}
    </div>
  )
}
