import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

const readPersistedToken = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    return stored?.state?.token as string | null
  } catch {
    return null
  }
}

export const getSocket = () => {
  const token = readPersistedToken()
  if (!token) return null

  if (!socket) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    socket = io(apiUrl.replace(/\/api\/?$/, ''), {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: false,
    })
  } else {
    socket.auth = { token }
  }

  if (!socket.connected) socket.connect()
  return socket
}

export const disconnectSocket = () => {
  socket?.disconnect()
  socket = null
}
