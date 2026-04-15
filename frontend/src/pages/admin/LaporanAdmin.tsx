import { useState } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { FileText, Download, Loader2, AlertCircle, CheckCircle2, Printer } from 'lucide-react'
import api from '@/api/axios'
import { cn } from '@/lib/utils'

interface AppointmentRow {
  id: string
  studentName: string
  studentNim: string
  studentFaculty: string
  studentMajor: string
  counselorName: string
  counselorSpecialization: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  counselingType: string
  diagnosisCategory: string
  actionPlan: string
}

interface ReportData {
  summary: {
    totalAppointments: number
    completedSessions: number
    cancelledSessions: number
    uniqueStudents: number
    uniqueCounselors: number
  }
  appointments: AppointmentRow[]
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  COMPLETED: { label: 'Selesai', cls: 'bg-blue-100 text-blue-700' },
  CANCELLED: { label: 'Dibatalkan', cls: 'bg-red-100 text-red-700' },
  APPROVED:  { label: 'Dikonfirmasi', cls: 'bg-green-100 text-green-700' },
  PENDING:   { label: 'Menunggu', cls: 'bg-gray-100 text-gray-700' },
  REJECTED:  { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
}

export default function LaporanAdmin() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!startDate || !endDate) { setError('Pilih rentang tanggal terlebih dahulu.'); return }
    if (new Date(startDate) > new Date(endDate)) { setError('Tanggal mulai harus sebelum tanggal akhir.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await api.get(`/reports/generate?startDate=${startDate}&endDate=${endDate}`)
      setReport(res.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghasilkan laporan.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
    catch { return d }
  }

  const formatTime = (t: string) => {
    try { return new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
    catch { return t?.substring(11, 16) || '-' }
  }

  // ── Export CSV ──────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!report) return
    const headers = [
      'No', 'Nama Mahasiswa', 'NIM', 'Fakultas', 'Jurusan',
      'Nama Konselor', 'Spesialisasi', 'Tanggal', 'Jam Mulai', 'Jam Selesai',
      'Tipe Konseling', 'Status', 'Kategori Diagnosis', 'Rencana Tindak Lanjut'
    ]
    const rows = report.appointments.map((a, i) => [
      i + 1,
      `"${a.studentName}"`,
      a.studentNim,
      `"${a.studentFaculty}"`,
      `"${a.studentMajor}"`,
      `"${a.counselorName}"`,
      `"${a.counselorSpecialization}"`,
      formatDate(a.appointmentDate),
      formatTime(a.startTime),
      formatTime(a.endTime),
      a.counselingType === 'online' ? 'Online' : 'Tatap Muka',
      STATUS_MAP[a.status]?.label || a.status,
      `"${a.diagnosisCategory}"`,
      `"${a.actionPlan}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `laporan_konseling_${startDate}_sd_${endDate}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ── Print / Cetak PDF ─────────────────────────────────────────
  const handlePrint = () => {
    window.print()
  }

  const statCards = report ? [
    { label: 'Total Sesi', value: report.summary.totalAppointments, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Sesi Selesai', value: report.summary.completedSessions, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    { label: 'Dibatalkan/Ditolak', value: report.summary.cancelledSessions, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    { label: 'Mahasiswa Aktif', value: report.summary.uniqueStudents, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
    { label: 'Konselor Terlibat', value: report.summary.uniqueCounselors, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  ] : []

  return (
    <DashboardLayout role="admin">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="mb-6 no-print">
        <h1 className="text-2xl font-bold text-foreground">Laporan Sistem</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate dan ekspor laporan konseling berdasarkan rentang tanggal.
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6 no-print">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Parameter Laporan
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setError('') }}
              className="h-10 px-3 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setError('') }}
              className="h-10 px-3 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="h-10 px-5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" />Memproses...</>
              : <><FileText className="h-4 w-4" />Generate Laporan</>
            }
          </button>
        </div>
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1 mt-3">
            <AlertCircle className="h-3 w-3" />{error}
          </p>
        )}
      </div>

      {/* Report Result */}
      {report && (
        <div id="print-area" className="space-y-6">

          {/* Print Header — hanya muncul saat print */}
          <div className="hidden print:block mb-4">
            <h1 className="text-xl font-bold">Laporan Sistem Konseling UniCounsel</h1>
            <p className="text-sm text-gray-600">Periode: {formatDate(startDate)} — {formatDate(endDate)}</p>
          </div>

          {/* Success Banner + Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 no-print">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800">Laporan berhasil digenerate</p>
              <p className="text-xs text-green-600">
                Periode: {formatDate(startDate)} — {formatDate(endDate)} · {report.appointments.length} data
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-green-300 text-green-700 hover:bg-green-100 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                Cetak / PDF
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map(s => (
              <div key={s.label} className={cn('rounded-xl border p-4', s.bg)}>
                <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Detail Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">
                Detail Sesi ({report.appointments?.length || 0} data)
              </h3>
            </div>
            {(report.appointments?.length || 0) > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">No</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Mahasiswa</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Konselor</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Tanggal & Jam</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Tipe</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.appointments.map((a, i) => {
                      const s = STATUS_MAP[a.status] || STATUS_MAP.PENDING
                      return (
                        <tr key={a.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground text-center">{i + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{a.studentName}</p>
                            <p className="text-xs text-muted-foreground">{a.studentNim} · {a.studentFaculty}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-foreground">{a.counselorName}</p>
                            <p className="text-xs text-muted-foreground">{a.counselorSpecialization}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            <p>{formatDate(a.appointmentDate)}</p>
                            <p className="text-xs">{formatTime(a.startTime)} – {formatTime(a.endTime)}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">
                            {a.counselingType === 'online' ? '🌐 Online' : '🏢 Tatap Muka'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', s.cls)}>{s.label}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Tidak ada data dalam periode ini.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
