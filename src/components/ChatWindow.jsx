'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/hooks/useSocket'

export default function ChatWindow({ conversationId, otherUser }) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  // Load messages
  useEffect(() => {
    if (!conversationId) return
    fetch(`/api/messages/${conversationId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || [])
        setLoading(false)
      })
  }, [conversationId])

  // Socket — receive new messages
  const handleNewMessage = useCallback(
    (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg])
      }
    },
    [conversationId]
  )

  useSocket(conversationId, handleNewMessage)

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')

    const res = await fetch(`/api/messages/${conversationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    if (res.ok) {
      const data = await res.json()
      // Optimistic update (server also broadcasts via Socket.io)
      setMessages((prev) => [...prev, data.message])
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted text-sm">
        Loading messages...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary font-bold text-sm flex items-center justify-center">
          {otherUser?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="font-semibold text-neutral-charcoal text-sm">{otherUser?.name}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted py-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === session?.user?.id
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isOwn
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-gray-100 text-neutral-charcoal rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="px-4 py-4 border-t border-gray-100 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 input py-2.5"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="btn-primary px-5 py-2.5 text-sm"
        >
          Send
        </button>
      </form>
    </div>
  )
}
