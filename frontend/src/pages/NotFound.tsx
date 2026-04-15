import { useNavigate } from 'react-router-dom'
import { FileQuestion, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <FileQuestion className="h-16 w-16 text-primary" />
      </div>
      <h1 className="text-4xl justify-center font-bold text-foreground mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-foreground mb-4">Halaman Tidak Ditemukan</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Beranda
      </button>
    </div>
  )
}
