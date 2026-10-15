import { useCallback, useRef, useState } from 'react'
import { streamReply } from '../lib/mockChatApi'

let nextId = 1
const makeMsg = (role, content = '') => ({ id: nextId++, role, content })

// status: 'idle' | 'loading' (no token yet) | 'streaming' | 'error'
export function useChat() {
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const send = useCallback(async (text) => {
    const reply = makeMsg('assistant')
    setMessages((m) => [...m, makeMsg('user', text), reply])
    setError(null)
    setStatus('loading')
    const controller = new AbortController()
    abortRef.current = controller
    try {
      for await (const token of streamReply(text, controller.signal)) {
        setStatus('streaming')
        setMessages((m) =>
          m.map((msg) => (msg.id === reply.id ? { ...msg, content: msg.content + token } : msg))
        )
      }
      setStatus('idle')
    } catch (err) {
      if (err.name === 'AbortError') setStatus('idle') // user pressed Stop: keep partial text
      else { setError(err.message); setStatus('error') }
    } finally {
      abortRef.current = null
    }
  }, [])

  const stop = () => abortRef.current?.abort()

  const retry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    setMessages((m) => m.slice(0, -2)) // drop the failed user + assistant pair, then resend
    send(lastUser.content)
  }

  return { messages, status, error, send, stop, retry }
}