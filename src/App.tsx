import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import LandingPage from './components/LandingPage'
import EditorRoom from './components/EditorRoom'

function App() {
  const [roomId, setRoomId] = useState<string | null>(null)

  useEffect(() => {
    // Check URL for room ID
    const hash = window.location.hash.slice(1)
    if (hash) {
      setRoomId(hash)
    }

    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1)
      setRoomId(newHash || null)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const createRoom = () => {
    const newRoomId = nanoid(10)
    window.location.hash = newRoomId
    setRoomId(newRoomId)
  }

  const joinRoom = (id: string) => {
    window.location.hash = id
    setRoomId(id)
  }

  const leaveRoom = () => {
    window.location.hash = ''
    setRoomId(null)
  }

  if (roomId) {
    return <EditorRoom roomId={roomId} onLeave={leaveRoom} />
  }

  return <LandingPage onCreateRoom={createRoom} onJoinRoom={joinRoom} />
}

export default App
