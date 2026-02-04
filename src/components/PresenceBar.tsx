interface UserState {
  name: string
  color: string
  cursor?: { index: number; length: number }
}

interface PresenceBarProps {
  users: Map<number, UserState>
  localColor: string
  localName: string
}

export default function PresenceBar({ users, localColor, localName }: PresenceBarProps) {
  const allUsers = [
    { name: localName, color: localColor, isLocal: true },
    ...Array.from(users.values()).map(u => ({ ...u, isLocal: false }))
  ]

  if (allUsers.length <= 1) {
    return (
      <div className="bg-slate-800/30 border-b border-slate-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-slate-700"
              style={{ backgroundColor: localColor }}
            >
              {localName[0]?.toUpperCase()}
            </span>
            <span className="text-slate-400">{localName} (you)</span>
          </div>
          <span className="text-slate-600">•</span>
          <span>Share the link to collaborate with others</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 border-b border-slate-800 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <span className="text-xs text-slate-500">Collaborators:</span>
        <div className="flex items-center gap-1 flex-wrap">
          {allUsers.map((user, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700/50"
              title={user.isLocal ? `${user.name} (you)` : user.name}
            >
              <span 
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-medium"
                style={{ backgroundColor: user.color }}
              >
                {user.name[0]?.toUpperCase()}
              </span>
              <span className="text-xs text-slate-300 max-w-20 truncate">
                {user.name}
                {user.isLocal && <span className="text-slate-500 ml-1">(you)</span>}
              </span>
            </div>
          ))}
        </div>
        
        {/* Typing indicators could go here */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex -space-x-2">
            {allUsers.slice(0, 5).map((user, index) => (
              <span
                key={index}
                className="w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-[10px] font-medium"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name[0]?.toUpperCase()}
              </span>
            ))}
            {allUsers.length > 5 && (
              <span className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-white text-[10px] font-medium">
                +{allUsers.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
