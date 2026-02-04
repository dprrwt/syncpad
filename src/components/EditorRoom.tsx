import { useState, useEffect, useRef, useCallback } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { Awareness } from 'y-protocols/awareness'
import PresenceBar from './PresenceBar'
import MarkdownPreview from './MarkdownPreview'

interface EditorRoomProps {
  roomId: string
  onLeave: () => void
}

interface UserState {
  name: string
  color: string
  cursor?: { index: number; length: number }
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
  '#ec4899', '#f43f5e'
]

const ANIMALS = [
  'Fox', 'Wolf', 'Bear', 'Lion', 'Tiger', 'Eagle', 'Hawk', 'Owl',
  'Panda', 'Koala', 'Otter', 'Seal', 'Dolphin', 'Whale', 'Shark'
]

function generateName(): string {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const num = Math.floor(Math.random() * 100)
  return `${animal}${num}`
}

function generateColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

export default function EditorRoom({ roomId, onLeave }: EditorRoomProps) {
  const [text, setText] = useState('')
  const [users, setUsers] = useState<Map<number, UserState>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [showMarkdown, setShowMarkdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [userName, setUserName] = useState(() => generateName())
  const [userColor] = useState(() => generateColor())
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebrtcProvider | null>(null)
  const ytextRef = useRef<Y.Text | null>(null)
  const awarenessRef = useRef<Awareness | null>(null)
  const isLocalChangeRef = useRef(false)

  // Initialize Yjs
  useEffect(() => {
    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    const provider = new WebrtcProvider(`syncpad-${roomId}`, ydoc, {
      signaling: [
        'wss://signaling.yjs.dev',
        'wss://y-webrtc-ckynr.ondigitalocean.app',
        'wss://signaling.yjs.io'
      ],
      // Add STUN servers for better NAT traversal
      peerOpts: {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      }
    })
    providerRef.current = provider

    const ytext = ydoc.getText('content')
    ytextRef.current = ytext

    const awareness = provider.awareness
    awarenessRef.current = awareness

    // Set local user state
    awareness.setLocalState({
      name: userName,
      color: userColor,
      cursor: null
    })

    // Listen to text changes
    ytext.observe(() => {
      if (!isLocalChangeRef.current) {
        setText(ytext.toString())
      }
    })

    // Listen to awareness changes
    const awarenessChangeHandler = () => {
      const states = new Map<number, UserState>()
      awareness.getStates().forEach((state, clientId) => {
        if (state && clientId !== awareness.clientID) {
          states.set(clientId, state as UserState)
        }
      })
      setUsers(states)
    }

    awareness.on('change', awarenessChangeHandler)

    // Connection status
    provider.on('synced', () => {
      setIsConnected(true)
      setText(ytext.toString())
    })

    // Initial text
    setText(ytext.toString())

    return () => {
      awareness.off('change', awarenessChangeHandler)
      provider.destroy()
      ydoc.destroy()
    }
  }, [roomId, userName, userColor])

  // Update awareness when username changes
  useEffect(() => {
    if (awarenessRef.current) {
      awarenessRef.current.setLocalStateField('name', userName)
    }
  }, [userName])

  // Handle text change
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const ytext = ytextRef.current
    if (!ytext) return

    isLocalChangeRef.current = true
    
    // Calculate diff and apply to Yjs
    const oldValue = ytext.toString()
    
    if (newValue !== oldValue) {
      // Simple diff: delete all and insert new (for simplicity)
      // In production, use proper diff algorithm
      ydocRef.current?.transact(() => {
        ytext.delete(0, ytext.length)
        ytext.insert(0, newValue)
      })
    }
    
    setText(newValue)
    isLocalChangeRef.current = false
  }, [])

  // Handle cursor/selection change
  const handleSelect = useCallback(() => {
    if (!textareaRef.current || !awarenessRef.current) return
    
    const { selectionStart, selectionEnd } = textareaRef.current
    awarenessRef.current.setLocalStateField('cursor', {
      index: selectionStart,
      length: selectionEnd - selectionStart
    })
  }, [])

  // Copy room link
  const copyLink = () => {
    const link = `${window.location.origin}${window.location.pathname}#${roomId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const connectionCount = users.size + 1

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo & Room Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={onLeave}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Leave room"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h1 className="font-semibold text-white text-sm">SyncPad</h1>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                  <span className="text-xs text-slate-400">{roomId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* User Name */}
            <div className="hidden sm:flex items-center gap-2 mr-4">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: userColor }}
              />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-transparent text-sm text-slate-300 border-b border-transparent hover:border-slate-600 focus:border-indigo-500 focus:outline-none px-1 w-24"
              />
            </div>

            {/* Toggle View */}
            <button
              onClick={() => setShowMarkdown(!showMarkdown)}
              className={`p-2 rounded-lg transition-colors ${showMarkdown ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'}`}
              title={showMarkdown ? 'Show editor' : 'Show preview'}
            >
              {showMarkdown ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>

            {/* Copy Link */}
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-emerald-400 hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-slate-300 hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* Connection Count */}
            <div className="flex items-center gap-1 px-3 py-2 bg-slate-800 rounded-lg">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm text-slate-300">{connectionCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Presence Bar */}
      <PresenceBar users={users} localColor={userColor} localName={userName} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4">
        <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden flex flex-col min-h-0">
          {showMarkdown ? (
            <MarkdownPreview content={text} />
          ) : (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onSelect={handleSelect}
              onKeyUp={handleSelect}
              onClick={handleSelect}
              placeholder="Start typing... Your changes sync in real-time with others in this room.

# Try some Markdown!

**Bold**, *italic*, `code`

- List item
- Another item

> Blockquote

```
Code block
```"
              className="flex-1 w-full p-6 bg-transparent text-slate-100 placeholder-slate-600 resize-none focus:outline-none font-mono text-sm leading-relaxed"
              spellCheck="false"
            />
          )}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>{text.length} characters</span>
            <span>{text.split(/\s+/).filter(Boolean).length} words</span>
            <span>{text.split('\n').length} lines</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span>{isConnected ? 'Synced' : 'Connecting...'}</span>
          </div>
        </div>
      </main>
    </div>
  )
}
