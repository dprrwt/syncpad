import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
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
  '#4fc1ff', '#c586c0', '#dcdcaa', '#6a9955', '#ce9178',
  '#9cdcfe', '#d7ba7d', '#f44747', '#b5cea8', '#569cd6'
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

// VS Code Icons as SVG components
const FileIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
    <path d="M13.85 4.44l-3.28-3.3-.35-.14H2.5l-.5.5v13l.5.5h11l.5-.5V4.8l-.15-.36zm-.85 10.06H3V2h6v3.5l.5.5H13v8.5z"/>
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
    <path d="M15.25 0a.75.75 0 0 1 .75.75V15.25a.75.75 0 0 1-1.5 0V.75a.75.75 0 0 1 .75-.75zM.75 0a.75.75 0 0 1 .75.75V15.25a.75.75 0 0 1-1.5 0V.75A.75.75 0 0 1 .75 0zM11 6a5 5 0 1 0-2.26 4.18l2.9 2.9a.75.75 0 1 0 1.06-1.06l-2.88-2.88A5 5 0 0 0 11 6zM6 9.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/>
  </svg>
)

const GitIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
    <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5h-3.32zM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
    <path d="M9.1 4.4L8.6 2H7.4l-.5 2.4-.7.3-2-1.3-.9.8 1.3 2-.2.7-2.4.5v1.2l2.4.5.3.8-1.3 2 .8.8 2-1.3.8.3.4 2.3h1.2l.5-2.4.8-.3 2 1.3.8-.8-1.3-2 .3-.8 2.3-.4V7.4l-2.4-.5-.3-.8 1.3-2-.8-.8-2 1.3-.7-.2zM9.4 1l.5 2.4L12 2.1l2 2-1.4 2.1 2.4.4v2.8l-2.4.5L14 12l-2 2-2.1-1.4-.5 2.4H6.6l-.5-2.4L4 13.9l-2-2 1.4-2.1L1 9.4V6.6l2.4-.5L2 4l2-2 2.1 1.4.4-2.4h2.8zM8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-1a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
  </svg>
)

const CloseIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.708.708L7.293 8l-3.647 3.646.708.708L8 8.707z"/>
  </svg>
)

const SplitIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
    <path d="M14 1H3L2 2v11l1 1h11l1-1V2l-1-1zM8 13H3V2h5v11zm6 0H9V2h5v11z"/>
  </svg>
)

const PreviewIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
  </svg>
)

export default function EditorRoom({ roomId, onLeave }: EditorRoomProps) {
  const [text, setText] = useState('')
  const [users, setUsers] = useState<Map<number, UserState>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [showMarkdown, setShowMarkdown] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [copied, setCopied] = useState(false)
  const [userName, setUserName] = useState(() => generateName())
  const [userColor] = useState(() => generateColor())
  const [activeActivity, setActiveActivity] = useState<'files' | 'search' | 'git' | 'extensions' | 'users'>('users')
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const ytextRef = useRef<Y.Text | null>(null)
  const awarenessRef = useRef<WebsocketProvider['awareness'] | null>(null)
  const isLocalChangeRef = useRef(false)

  // Line numbers
  const lineNumbers = useMemo(() => {
    const lines = text.split('\n').length
    return Array.from({ length: Math.max(lines, 20) }, (_, i) => i + 1)
  }, [text])

  // Initialize Yjs
  useEffect(() => {
    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    const provider = new WebsocketProvider(
      'wss://demos.yjs.dev/ws',
      `syncpad-${roomId}`,
      ydoc
    )
    providerRef.current = provider

    const ytext = ydoc.getText('content')
    ytextRef.current = ytext

    const awareness = provider.awareness
    awarenessRef.current = awareness

    awareness.setLocalState({
      name: userName,
      color: userColor,
      cursor: null
    })

    ytext.observe(() => {
      if (!isLocalChangeRef.current) {
        setText(ytext.toString())
      }
    })

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

    provider.on('status', (event: { status: string }) => {
      setIsConnected(event.status === 'connected')
    })
    
    provider.on('sync', (isSynced: boolean) => {
      if (isSynced) {
        setText(ytext.toString())
      }
    })

    setIsConnected(provider.wsconnected)
    setText(ytext.toString())

    return () => {
      awareness.off('change', awarenessChangeHandler)
      provider.destroy()
      ydoc.destroy()
    }
  }, [roomId, userName, userColor])

  useEffect(() => {
    if (awarenessRef.current) {
      awarenessRef.current.setLocalStateField('name', userName)
    }
  }, [userName])

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const ytext = ytextRef.current
    if (!ytext) return

    isLocalChangeRef.current = true
    
    const oldValue = ytext.toString()
    
    if (newValue !== oldValue) {
      ydocRef.current?.transact(() => {
        ytext.delete(0, ytext.length)
        ytext.insert(0, newValue)
      })
    }
    
    setText(newValue)
    isLocalChangeRef.current = false
  }, [])

  const handleSelect = useCallback(() => {
    if (!textareaRef.current || !awarenessRef.current) return
    
    const { selectionStart, selectionEnd } = textareaRef.current
    awarenessRef.current.setLocalStateField('cursor', {
      index: selectionStart,
      length: selectionEnd - selectionStart
    })
  }, [])

  const copyLink = () => {
    const link = `${window.location.origin}${window.location.pathname}#${roomId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const connectionCount = users.size + 1
  const allUsers = [{ name: userName, color: userColor, isYou: true }, ...Array.from(users.values()).map(u => ({ ...u, isYou: false }))]

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Title Bar */}
      <div className="h-8 flex items-center justify-between px-2" style={{ backgroundColor: '#3c3c3c' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={onLeave}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Leave room"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <span className="text-xs text-gray-400">SyncPad — {roomId}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
          <span className="text-xs text-gray-400">{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 flex flex-col items-center py-2 gap-1" style={{ backgroundColor: '#333333' }}>
          <button
            onClick={() => { setActiveActivity('files'); setShowSidebar(true) }}
            className={`activity-icon ${activeActivity === 'files' && showSidebar ? 'active' : ''}`}
            title="Explorer"
          >
            <FileIcon />
          </button>
          <button
            onClick={() => { setActiveActivity('search'); setShowSidebar(true) }}
            className={`activity-icon ${activeActivity === 'search' && showSidebar ? 'active' : ''}`}
            title="Search"
          >
            <SearchIcon />
          </button>
          <button
            onClick={() => { setActiveActivity('git'); setShowSidebar(true) }}
            className={`activity-icon ${activeActivity === 'git' && showSidebar ? 'active' : ''}`}
            title="Source Control"
          >
            <GitIcon />
          </button>
          <button
            onClick={() => { setActiveActivity('users'); setShowSidebar(true) }}
            className={`activity-icon ${activeActivity === 'users' && showSidebar ? 'active' : ''}`}
            title="Collaborators"
          >
            <UsersIcon />
          </button>
          <div className="flex-1" />
          <button
            className="activity-icon"
            title="Settings"
          >
            <SettingsIcon />
          </button>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-60 flex flex-col" style={{ backgroundColor: '#252526' }}>
            <div className="h-9 flex items-center px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#bbbbbb' }}>
              {activeActivity === 'users' ? 'Collaborators' : activeActivity === 'files' ? 'Explorer' : activeActivity}
            </div>
            
            {activeActivity === 'users' && (
              <div className="flex-1 overflow-auto px-2">
                {allUsers.map((user, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: user.color }}
                    />
                    <span className="text-sm truncate" style={{ color: '#cccccc' }}>
                      {user.name} {user.isYou && <span style={{ color: '#858585' }}>(you)</span>}
                    </span>
                  </div>
                ))}
                
                <div className="mt-4 px-2">
                  <button
                    onClick={copyLink}
                    className="w-full py-1.5 text-xs text-white rounded transition-colors"
                    style={{ backgroundColor: copied ? '#16825d' : '#0e639c' }}
                  >
                    {copied ? '✓ Link Copied!' : 'Copy Invite Link'}
                  </button>
                </div>
                
                <div className="mt-4 px-2">
                  <label className="text-xs" style={{ color: '#858585' }}>Your name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="vscode-input w-full mt-1"
                  />
                </div>
              </div>
            )}
            
            {activeActivity === 'files' && (
              <div className="flex-1 overflow-auto px-2">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded" style={{ backgroundColor: '#37373d' }}>
                  <FileIcon />
                  <span className="text-sm" style={{ color: '#cccccc' }}>{roomId}.md</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="h-9 flex items-center" style={{ backgroundColor: '#252526' }}>
            <div 
              className="h-full flex items-center gap-2 px-3 border-t-2"
              style={{ 
                backgroundColor: '#1e1e1e',
                borderTopColor: '#007acc',
                color: '#ffffff'
              }}
            >
              <FileIcon />
              <span className="text-sm">{roomId}.md</span>
              <button className="p-0.5 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100">
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1 px-2">
              <button
                onClick={() => setShowMarkdown(!showMarkdown)}
                className={`p-1.5 rounded transition-colors ${showMarkdown ? 'bg-white/10' : 'hover:bg-white/10'}`}
                title={showMarkdown ? 'Show Editor' : 'Show Preview'}
                style={{ color: showMarkdown ? '#ffffff' : '#858585' }}
              >
                <PreviewIcon />
              </button>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Toggle Sidebar"
                style={{ color: '#858585' }}
              >
                <SplitIcon />
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden" style={{ backgroundColor: '#1e1e1e' }}>
            {showMarkdown ? (
              <div className="flex-1 overflow-auto">
                <MarkdownPreview content={text} />
              </div>
            ) : (
              <>
                {/* Line Numbers */}
                <div 
                  className="py-4 pr-4 text-right select-none overflow-hidden"
                  style={{ 
                    backgroundColor: '#1e1e1e',
                    color: '#858585',
                    fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
                    fontSize: '14px',
                    lineHeight: '1.5',
                    minWidth: '50px'
                  }}
                >
                  {lineNumbers.map(n => (
                    <div key={n}>{n}</div>
                  ))}
                </div>

                {/* Text Editor */}
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  onSelect={handleSelect}
                  onKeyUp={handleSelect}
                  onClick={handleSelect}
                  placeholder="// Start typing...&#10;// Changes sync in real-time&#10;&#10;# Welcome to SyncPad&#10;&#10;**Collaborate** in real-time with anyone.&#10;Just share the link!"
                  className="flex-1 py-4 bg-transparent resize-none focus:outline-none"
                  style={{
                    color: '#d4d4d4',
                    fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
                    fontSize: '14px',
                    lineHeight: '1.5',
                    caretColor: '#aeafad'
                  }}
                  spellCheck="false"
                />

                {/* Minimap placeholder */}
                <div className="w-16 opacity-50" style={{ backgroundColor: '#1e1e1e' }}>
                  <div className="p-1 text-[2px] leading-none overflow-hidden" style={{ color: '#858585' }}>
                    {text.slice(0, 500)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div 
        className="h-6 flex items-center justify-between px-2 text-xs"
        style={{ backgroundColor: '#007acc', color: '#ffffff' }}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8z"/>
            </svg>
            {isConnected ? 'Live' : 'Offline'}
          </span>
          <span>{connectionCount} collaborator{connectionCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Ln {text.split('\n').length}, Col 1</span>
          <span>UTF-8</span>
          <span>Markdown</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white/80"></span>
            Yjs
          </span>
        </div>
      </div>
    </div>
  )
}
