import { useEffect, useState, useRef, useCallback } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Send, Search, Loader2, MessageCircle, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/api/axios'
import { getSocket } from '@/api/socket'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
}

interface Contact {
  userId: string
  name: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export default function MahasiswaPesan() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [loadingInbox, setLoadingInbox] = useState(true)
  const [loadingChat, setLoadingChat] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectedContactRef = useRef<Contact | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => { selectedContactRef.current = selectedContact }, [selectedContact])

  const fetchInbox = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoadingInbox(true)
      const res = await api.get('/chat/inbox')
      setContacts(res.data.data || [])
    } catch {
      setContacts([])
    } finally {
      setLoadingInbox(false)
    }
  }, [])

  const fetchMessages = useCallback(async (contactId: string, silent = false) => {
    try {
      if (!silent) setLoadingChat(true)
      const res = await api.get(`/chat/${contactId}`)
      setMessages(res.data.data || [])
    } catch { /* silent */ }
    finally { setLoadingChat(false) }
  }, [])

  useEffect(() => { fetchInbox() }, [fetchInbox])
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onMessage = (message: Message) => {
      const contact = selectedContactRef.current
      if (contact && (message.senderId === contact.userId || message.receiverId === contact.userId)) {
        setMessages(current => current.some(item => item.id === message.id) ? current : [...current, message])
      }
      fetchInbox(true)
    }
    socket.on('message:new', onMessage)
    return () => { socket.off('message:new', onMessage) }
  }, [fetchInbox])
  useEffect(() => {
    const interval = setInterval(() => {
      const contact = selectedContactRef.current
      if (contact && document.visibilityState === 'visible') fetchMessages(contact.userId, true)
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  const selectContact = async (contact: Contact) => {
    setSelectedContact(contact)
    await fetchMessages(contact.userId)
    try {
      await api.patch(`/chat/${contact.userId}/read`)
      setContacts(prev => prev.map(c =>
        c.userId === contact.userId ? { ...c, unreadCount: 0 } : c
      ))
    } catch { /* silent */ }
  }

  const handleSend = async () => {
    if (!input.trim() || !selectedContact || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      const res = await api.post('/chat', { receiverId: selectedContact.userId, content: text })
      setMessages(prev => [...prev, res.data.data])
      setContacts(prev => prev.map(c =>
        c.userId === selectedContact.userId
          ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
          : c
      ))
    } catch {
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diffDays === 0) return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Kemarin'
    if (diffDays < 7) return d.toLocaleDateString('id-ID', { weekday: 'short' })
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  // Mobile: show list when no contact, show chat when contact selected
  const showChatOnMobile = selectedContact !== null

  return (
    <DashboardLayout role="student">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Pesan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Komunikasi dengan konselor Anda.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden flex h-[calc(100vh-220px)]">

        {/* ── Contact List — hidden on mobile when chat open ── */}
        <div className={cn(
          'flex flex-col border-r border-border',
          'w-full md:w-72 md:shrink-0',
          showChatOnMobile ? 'hidden md:flex' : 'flex'
        )}>
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari konselor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {loadingInbox ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                Belum ada percakapan.
              </div>
            ) : (
              filtered.map(c => (
                <button
                  key={c.userId}
                  onClick={() => selectContact(c)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50',
                    selectedContact?.userId === c.userId ? 'bg-accent' : 'hover:bg-secondary/40'
                  )}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {c.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate">{c.name}</span>
                      <span className="text-xs text-muted-foreground ml-1">{formatTime(c.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage || 'Mulai percakapan...'}</p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Chat Window — full width on mobile when contact selected ── */}
        {selectedContact ? (
          <div className={cn(
            'flex-1 flex flex-col min-w-0',
            showChatOnMobile ? 'flex' : 'hidden md:flex'
          )}>
            {/* Chat header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-border">
              <div className="flex items-center gap-3">
                {/* Back button — mobile only */}
                <button
                  onClick={() => setSelectedContact(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-secondary text-muted-foreground mr-1"
                  aria-label="Kembali ke daftar"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {selectedContact.name?.charAt(0) || '?'}
                </div>
                <p className="text-sm font-semibold text-foreground">{selectedContact.name}</p>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 bg-background/40">
              {loadingChat ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Mulai percakapan dengan {selectedContact.name}.
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId !== selectedContact.userId
                  return (
                    <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        'max-w-[75%] md:max-w-sm px-4 py-2.5 rounded-2xl text-sm',
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-card border border-border text-foreground rounded-bl-sm'
                      )}>
                        <p className="leading-relaxed">{msg.content}</p>
                        <p className={cn('text-[10px] mt-1', isMe ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground')}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2 items-end">
                <input
                  type="text"
                  placeholder="Ketik pesan..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="flex-1 h-10 px-4 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state — desktop only (mobile shows contact list) */
          <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-3">
            <MessageCircle className="h-12 w-12 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">Pilih konselor untuk memulai percakapan.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
