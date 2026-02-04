import { useState } from 'react'

interface LandingPageProps {
  onCreateRoom: () => void
  onJoinRoom: (roomId: string) => void
}

export default function LandingPage({ onCreateRoom, onJoinRoom }: LandingPageProps) {
  const [joinCode, setJoinCode] = useState('')

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (joinCode.trim()) {
      onJoinRoom(joinCode.trim())
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#1e1e1e' }}
    >
      <div className="max-w-md w-full">
        {/* VS Code Style Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 relative">
            {/* VS Code-like logo */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon 
                points="50,5 95,25 95,75 50,95 5,75 5,25" 
                fill="#007acc"
                opacity="0.9"
              />
              <polygon 
                points="50,15 85,30 85,70 50,85 15,70 15,30" 
                fill="#1e1e1e"
              />
              <text 
                x="50" 
                y="58" 
                textAnchor="middle" 
                fill="#cccccc" 
                fontSize="24" 
                fontFamily="Consolas, monospace"
                fontWeight="bold"
              >
                {'</>'}
              </text>
            </svg>
          </div>
          <h1 
            className="text-4xl font-light mb-2"
            style={{ color: '#cccccc', fontFamily: "'Segoe UI', sans-serif" }}
          >
            SyncPad
          </h1>
          <p style={{ color: '#858585' }}>
            Real-time collaborative code editor
          </p>
        </div>

        {/* Main Card - VS Code Welcome Tab Style */}
        <div 
          className="rounded-lg p-8"
          style={{ 
            backgroundColor: '#252526',
            border: '1px solid #3c3c3c'
          }}
        >
          {/* Start Section */}
          <h2 
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: '#007acc' }}
          >
            Start
          </h2>
          
          <button
            onClick={onCreateRoom}
            className="w-full py-3 px-4 rounded mb-6 flex items-center gap-3 transition-colors text-left group"
            style={{ 
              backgroundColor: '#0e639c',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1177bb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0e639c'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <div>
              <div className="font-medium">New Room</div>
              <div className="text-xs opacity-75">Create a new collaborative session</div>
            </div>
          </button>

          {/* Recent Section */}
          <h2 
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: '#007acc' }}
          >
            Join
          </h2>

          <form onSubmit={handleJoin} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter room code or paste link..."
                className="vscode-input w-full py-2.5"
                style={{
                  backgroundColor: '#3c3c3c',
                  border: '1px solid #3c3c3c',
                  color: '#cccccc'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#007acc'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#3c3c3c'}
              />
            </div>
            <button
              type="submit"
              disabled={!joinCode.trim()}
              className="w-full py-2.5 px-4 rounded flex items-center justify-center gap-2 transition-all"
              style={{ 
                backgroundColor: joinCode.trim() ? '#3c3c3c' : '#2d2d2d',
                color: joinCode.trim() ? '#cccccc' : '#6e6e6e',
                cursor: joinCode.trim() ? 'pointer' : 'not-allowed'
              }}
              onMouseEnter={(e) => { if (joinCode.trim()) e.currentTarget.style.backgroundColor = '#4a4a4a' }}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = joinCode.trim() ? '#3c3c3c' : '#2d2d2d'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
              </svg>
              Join Room
            </button>
          </form>

          {/* Divider */}
          <div 
            className="my-6"
            style={{ borderTop: '1px solid #3c3c3c' }}
          />

          {/* Learn Section */}
          <h2 
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: '#007acc' }}
          >
            Features
          </h2>

          <div className="space-y-2">
            {[
              { icon: '⚡', text: 'Real-time sync via Yjs CRDT', color: '#dcdcaa' },
              { icon: '🔒', text: 'End-to-end encrypted', color: '#4ec9b0' },
              { icon: '👥', text: 'See collaborators live', color: '#9cdcfe' },
              { icon: '📝', text: 'Markdown preview', color: '#ce9178' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-white/5 transition-colors"
              >
                <span>{feature.icon}</span>
                <span style={{ color: feature.color }} className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - VS Code style */}
        <div 
          className="mt-6 flex items-center justify-center gap-4 text-xs"
          style={{ color: '#6e6e6e' }}
        >
          <span>v1.0.0</span>
          <span>•</span>
          <a 
            href="https://github.com/dprrwt/syncpad" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: '#3794ff' }}
          >
            GitHub
          </a>
          <span>•</span>
          <span>Built with Yjs</span>
        </div>

        {/* Keyboard hint */}
        <div 
          className="mt-4 text-center text-xs"
          style={{ color: '#4a4a4a' }}
        >
          <kbd 
            className="px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: '#3c3c3c', color: '#858585' }}
          >
            Ctrl
          </kbd>
          {' + '}
          <kbd 
            className="px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: '#3c3c3c', color: '#858585' }}
          >
            N
          </kbd>
          {' to create new room'}
        </div>
      </div>
    </div>
  )
}
