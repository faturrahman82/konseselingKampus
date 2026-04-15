import { useEffect, useState, useCallback } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Newspaper, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'

interface Article {
  title: string
  description: string
  url: string
  imageUrl: string
  source: string
  publishedAt: string
}

const CATEGORIES = [
  { key: 'all',      label: 'Semua' },
  { key: 'stres',    label: 'Stres' },
  { key: 'cemas',    label: 'Kecemasan' },
  { key: 'akademik', label: 'Akademik' },
  { key: 'relasi',   label: 'Hubungan Sosial' },
]

const ArticleSkeleton = () => (
  <div className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
    <div className="h-44 bg-secondary" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-secondary rounded w-1/3" />
      <div className="h-4 bg-secondary rounded w-full" />
      <div className="h-4 bg-secondary rounded w-4/5" />
      <div className="h-3 bg-secondary rounded w-full" />
      <div className="h-3 bg-secondary rounded w-2/3" />
    </div>
  </div>
)

export default function MahasiswaArtikel() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const fetchArticles = useCallback(async (category: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/articles?category=${category}`)
      setArticles(res.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat artikel. Coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles(activeCategory)
  }, [activeCategory, fetchArticles])

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch { return d }
  }

  return (
    <DashboardLayout role="student">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Newspaper className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Artikel Kesehatan Mental</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          Baca artikel terkini seputar kesehatan mental, stres akademik, dan kehidupan kampus.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeCategory === cat.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            {cat.label}
          </button>
        ))}
        <button
          onClick={() => fetchArticles(activeCategory)}
          className="ml-auto p-2 rounded-xl border border-border text-muted-foreground hover:bg-secondary transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
          <button
            onClick={() => fetchArticles(activeCategory)}
            className="text-xs text-destructive underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <ArticleSkeleton key={i} />)}
        </div>
      )}

      {/* Articles Grid */}
      {!loading && !error && (
        <>
          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Newspaper className="h-12 w-12 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">Tidak ada artikel untuk kategori ini.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-4">{articles.length} artikel ditemukan</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {articles.map((article, i) => (
                  <a
                    key={i}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden bg-secondary">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(article.source)}&background=1e3a8a&color=fff&size=400&format=svg`
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <span className="absolute bottom-2 left-3 text-[10px] font-semibold text-white bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {article.source}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-muted-foreground mb-2">{formatDate(article.publishedAt)}</p>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 flex-1">
                        {article.description}
                      </p>
                      <div className="flex items-center gap-1 mt-3 text-xs font-medium text-primary">
                        Baca Selengkapnya <ExternalLink className="h-3 w-3" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
