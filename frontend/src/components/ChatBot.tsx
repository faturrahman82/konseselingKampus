import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, Bot, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'

interface Message {
  role: 'user' | 'model'
  content: string
}

const WELCOME_MSG: Message = {
  role: 'model',
  content: 'Halo! Saya **Kana** 👋, asisten AI UniCounsel.\n\nSaya siap membantu kamu tentang:\n- 🧠 Kesehatan mental & psikologi mahasiswa\n- 📅 Cara menggunakan fitur UniCounsel\n- 💬 Berbagi cerita & mendapat dukungan\n\nAda yang ingin kamu ceritakan hari ini?',
}

function renderMarkdown(text: string) {
  // Simple markdown: **bold**, \n newlines, bullet -
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, minimized])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      // Kirim history (exclude welcome msg)
      const history = newMessages.slice(1, -1) // kecuali pesan terakhir (user)
      const res = await api.post('/chatbot/chat', {
        message: userMsg,
        history,
      })
      setMessages(prev => [...prev, { role: 'model', content: res.data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'model',
        content: 'Maaf, saya sedang mengalami gangguan. Coba lagi ya 😊',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Floating Button ── */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimized(false) }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
          aria-label="Buka chat Kana AI"
        >
          <Bot className="h-6 w-6" />
          {/* Pulse indicator */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white animate-pulse" />
        </button>
      )}

      {/* ── Chat Popup ── */}
      {open && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 w-[360px] bg-card rounded-2xl shadow-2xl border border-border flex flex-col transition-all duration-200',
            minimized ? 'h-14' : 'h-[500px]',
            'max-h-[calc(100vh-80px)]'
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-t-2xl bg-primary text-primary-foreground shrink-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border border-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-none">Kana AI</p>
              <p className="text-[10px] text-primary-foreground/70 mt-0.5">Asisten Kesehatan Mental UniCounsel</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(v => !v)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Minimize"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Tutup"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Body — hidden when minimized */}
          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50 scrollbar-thin">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    {msg.role === 'model' && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-card border border-border text-foreground rounded-bl-sm'
                      )}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border shrink-0">
                <div className="flex gap-2 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ketik pesanmu..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    disabled={loading}
                    className="flex-1 h-9 px-3 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
                  >
                    {loading
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Send className="h-3.5 w-3.5" />
                    }
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  Kana AI dapat memberikan informasi umum, bukan diagnosis profesional.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
