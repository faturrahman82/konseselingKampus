import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Respons server yang pasti gagal (termasuk schema drift/P2022) tidak
        // perlu diulang. Retry satu kali hanya untuk gangguan jaringan sesaat.
        if (axios.isAxiosError(error) && error.response) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
