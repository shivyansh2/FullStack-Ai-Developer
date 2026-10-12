import { useEffect, useRef, useState } from 'react'

export default function ChatPanel({ messages, status, error, send, stop, retry }) {
  const [input, setInput] = useState('')
  const endRef = useRef(null)
  const busy = status === 'loading' || status === 'streaming'

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onSubmit = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    send(text)
    setInput('')
  }

  return (
    <section className="card chat">
      <ul className="messages">
        {messages.length === 0 && (
          <li className="muted">Say hi. Include the word “error” to see the error state.</li>
        )}
        {messages.map((m, i) => {
          const isLast = i === messages.length - 1
          const thinking = isLast && status === 'loading'
          if (!m.content && !thinking) return null
          return (
            <li key={m.id} className={`msg ${m.role}`}>
              {m.content || <em className="muted">Thinking…</em>}
              {isLast && status === 'streaming' && <span className="caret" />}
            </li>
          )
        })}
        <li ref={endRef} aria-hidden="true" />
      </ul>

      {status === 'error' && (
        <p className="error" role="alert">
          {error} <button onClick={retry}>Retry</button>
        </p>
      )}

      <form className="row" onSubmit={onSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask something…" disabled={busy} />
        {busy ? (
          <button type="button" onClick={stop}>Stop</button>
        ) : (
          <button type="submit" disabled={!input.trim()}>Send</button>
        )}
      </form>
    </section>
  )
}