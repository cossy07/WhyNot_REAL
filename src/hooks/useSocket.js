'use client'

import { useEffect, useRef, useCallback } from 'react'
import { getSocket } from '@/lib/socket'

export function useSocket(conversationId, onMessage) {
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    if (conversationId) {
      socket.emit('join_conversation', conversationId)
    }

    socket.on('new_message', onMessage)

    return () => {
      socket.off('new_message', onMessage)
      if (conversationId) {
        socket.emit('leave_conversation', conversationId)
      }
    }
  }, [conversationId, onMessage])

  return socketRef
}

export function useUserSocket(userId) {
  useEffect(() => {
    if (!userId) return
    const socket = getSocket()
    socket.emit('join_user', userId)
  }, [userId])
}
