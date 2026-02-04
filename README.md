# SyncPad 📝

A real-time collaborative code editor with a VS Code-inspired interface. Built with React, Yjs, and WebSocket sync.

## ✨ Features

- **🔄 Real-time Sync** — Changes appear instantly via Yjs CRDT
- **💻 VS Code UI** — Activity bar, tabs, status bar, line numbers
- **👥 Live Presence** — See collaborators in the sidebar
- **📝 Markdown Preview** — Toggle between edit and rendered view
- **🌙 Dark Theme** — Authentic VS Code color palette
- **📱 Responsive** — Works on desktop and mobile
- **🔐 No Account** — Just create a room and share the link

## 🚀 Quick Start

### Create a Room
1. Visit [SyncPad](https://dprrwt.github.io/syncpad)
2. Click "New Room"
3. Share the URL with collaborators

### Join a Room
1. Get a room link from someone
2. Open the link directly, or
3. Paste the room code on the homepage

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | TailwindCSS v4 |
| **Real-time** | [Yjs](https://yjs.dev) (CRDT) + [y-websocket](https://github.com/yjs/y-websocket) |
| **Markdown** | react-markdown |

## 💻 Development

```bash
# Clone the repo
git clone https://github.com/dprrwt/syncpad.git
cd syncpad

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📖 How It Works

SyncPad uses **Yjs**, a high-performance CRDT (Conflict-free Replicated Data Type) implementation for real-time collaboration:

### Architecture

```
┌─────────┐     WebSocket     ┌─────────────────┐     WebSocket     ┌─────────┐
│ User A  │ ◄───────────────► │  Yjs Sync Server │ ◄───────────────► │ User B  │
└─────────┘                   └─────────────────┘                   └─────────┘
     │                                                                    │
     └──────────────────── Same Y.Doc state ──────────────────────────────┘
```

1. **CRDTs** — Every edit becomes a conflict-free operation that merges automatically
2. **WebSocket** — All clients connect to `wss://demos.yjs.dev/ws` for sync
3. **Awareness** — User presence (name, color) synced separately from document

### Sync Server

Uses the public Yjs demo WebSocket server:
- `wss://demos.yjs.dev/ws`

Document content passes through for sync, but nothing is stored persistently.

## 🎨 UI Features

| Feature | Description |
|---------|-------------|
| **Activity Bar** | Collaborators panel toggle |
| **Sidebar** | Shows all connected users with colors |
| **Tabs** | File tabs with active indicator |
| **Line Numbers** | Classic code editor gutter |
| **Status Bar** | Live status, collaborator count, line info |
| **Minimap** | Document overview on the right |

## 🎯 Use Cases

- **Pair Programming** — Write code together in real-time
- **Meeting Notes** — Collaborative note-taking
- **Brainstorming** — Jot down ideas together
- **Teaching** — Live coding demonstrations
- **Quick Sharing** — Share text without accounts

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features  
- Submit PRs

## 📄 License

MIT License — use freely for your own projects.

---

Built with ❤️ by [dprrwt](https://github.com/dprrwt) using [Yjs](https://yjs.dev)
