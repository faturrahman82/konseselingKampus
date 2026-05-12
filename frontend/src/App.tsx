import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

// ── Lazy Load semua pages (code splitting per route) ──
// Auth Pages
const Login            = lazy(() => import('./pages/Login'));
const Landing          = lazy(() => import('./pages/Landing'));
const Register         = lazy(() => import('./pages/Register'));
const ForgotPassword   = lazy(() => import('./pages/ForgotPassword'));
const CompleteProfile  = lazy(() => import('./pages/CompleteProfile'));
const ResetPassword    = lazy(() => import('./pages/ResetPassword'));

// Konselor Pages
const KonselorDashboard  = lazy(() => import('./pages/konselor/Dashboard'));
const KonselorMahasiswa  = lazy(() => import('./pages/konselor/Mahasiswa'));
const KonselorJadwal     = lazy(() => import('./pages/konselor/Jadwal'));
const KonselorPesan      = lazy(() => import('./pages/konselor/Pesan'));
const KonselorProfil     = lazy(() => import('./pages/konselor/Profil'));
const KonselorPengaturan = lazy(() => import('./pages/konselor/Pengaturan'));

// Admin Pages
const AdminDashboard   = lazy(() => import('./pages/admin/Dashboard'));
const KelolaKonselor   = lazy(() => import('./pages/admin/KelolaKonselor'));
const PengaturanSistem = lazy(() => import('./pages/admin/PengaturanSistem'));
const LaporanAdmin     = lazy(() => import('./pages/admin/LaporanAdmin'));

// Mahasiswa Pages
const MahasiswaDashboard  = lazy(() => import('./pages/mahasiswa/Dashboard'));
const CariKonselor        = lazy(() => import('./pages/mahasiswa/CariKonselor'));
const JadwalSaya          = lazy(() => import('./pages/mahasiswa/JadwalSaya'));
const MahasiswaPesan      = lazy(() => import('./pages/mahasiswa/Pesan'));
const MahasiswaProfil     = lazy(() => import('./pages/mahasiswa/Profil'));
const MahasiswaPengaturan = lazy(() => import('./pages/mahasiswa/Pengaturan'));
const MahasiswaArtikel    = lazy(() => import('./pages/mahasiswa/Artikel'));
const MoodCheckin         = lazy(() => import('./pages/mahasiswa/MoodCheckin'));
const NotFound            = lazy(() => import('./pages/NotFound'));

// ── Loading Fallback ──
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">Memuat halaman...</p>
    </div>
  </div>
);

// ── Protected Route ──
const ProtectedRoute = ({
  children,
  role,
}: {
  children: React.ReactNode
  role?: string
}) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  const theme = useThemeStore(state => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Listen for system theme changes if set to system
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <Router>
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: { fontFamily: 'inherit' },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Root */}
          <Route path="/" element={<Landing />} />

          {/* ── Auth Routes ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/lupa-sandi" element={<ForgotPassword />} />
          <Route path="/atur-ulang-sandi" element={<ResetPassword />} />
          <Route path="/lengkapi-profil" element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } />

          {/* ── Konselor Routes ── */}
          <Route path="/konselor/dasbor" element={
            <ProtectedRoute role="counselor">
              <KonselorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/konselor/mahasiswa" element={
            <ProtectedRoute role="counselor">
              <KonselorMahasiswa />
            </ProtectedRoute>
          } />
          <Route path="/konselor/jadwal" element={
            <ProtectedRoute role="counselor">
              <KonselorJadwal />
            </ProtectedRoute>
          } />
          <Route path="/konselor/pesan" element={
            <ProtectedRoute role="counselor">
              <KonselorPesan />
            </ProtectedRoute>
          } />
          <Route path="/konselor/profil" element={
            <ProtectedRoute role="counselor">
              <KonselorProfil />
            </ProtectedRoute>
          } />
          <Route path="/konselor/pengaturan" element={
            <ProtectedRoute role="counselor">
              <KonselorPengaturan />
            </ProtectedRoute>
          } />

          {/* ── Mahasiswa Routes ── */}
          <Route path="/mahasiswa/dasbor" element={
            <ProtectedRoute>
              <MahasiswaDashboard />
            </ProtectedRoute>
          } />
          <Route path="/mahasiswa/cari-konselor" element={
            <ProtectedRoute>
              <CariKonselor />
            </ProtectedRoute>
          } />
          <Route path="/mahasiswa/jadwal" element={
            <ProtectedRoute>
              <JadwalSaya />
            </ProtectedRoute>
          } />
          <Route path="/mahasiswa/pesan" element={
            <ProtectedRoute>
              <MahasiswaPesan />
            </ProtectedRoute>
          } />
          <Route path="/mahasiswa/profil" element={
            <ProtectedRoute>
              <MahasiswaProfil />
            </ProtectedRoute>
          } />
          <Route path="/mahasiswa/pengaturan" element={
            <ProtectedRoute>
              <MahasiswaPengaturan />
            </ProtectedRoute>
          } />
          <Route path="/mahasiswa/artikel" element={
            <ProtectedRoute>
              <MahasiswaArtikel />
            </ProtectedRoute>
          } />
          <Route path="/mahasiswa/mood" element={
            <ProtectedRoute>
              <MoodCheckin />
            </ProtectedRoute>
          } />

          {/* ── Admin Routes ── */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/konselor" element={
            <ProtectedRoute role="admin">
              <KelolaKonselor />
            </ProtectedRoute>
          } />
          <Route path="/admin/pengaturan" element={
            <ProtectedRoute role="admin">
              <PengaturanSistem />
            </ProtectedRoute>
          } />
          <Route path="/admin/laporan" element={
            <ProtectedRoute role="admin">
              <LaporanAdmin />
            </ProtectedRoute>
          } />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
