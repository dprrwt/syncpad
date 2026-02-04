# SyncPad 📝

A real-time collaborative text editor built with React, Yjs, and WebRTC. Write together, instantly.

![SyncPad Preview](https://raw.githubusercontent.com/dprrwt/syncpad/main/.github/preview.png)

## ✨ Features

- **🔄 Real-time Sync** — Changes appear instantly for all collaborators
- **🌐 Peer-to-Peer** — No server storage, direct WebRTC connections
- **👥 Live Presence** — See who's in the room with colored avatars
- **📝 Markdown Preview** — Toggle between edit and rendered markdown view
- **🎨 Beautiful UI** — Clean, dark theme with smooth animations
- **📱 Responsive** — Works on desktop and mobile
- **🔐 No Account** — Just create a room and share the link

## 🚀 Quick Start

### Create a Room
1. Visit [SyncPad](https://dprrwt.github.io/syncpad)
2. Click "Create New Room"
3. Share the URL with collaborators

### Join a Room
1. Get a room link from someone
2. Open the link, or
3. Paste the room code on the homepage

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** TailwindCSS v4
- **Real-time:** [Yjs](https://yjs.dev) (CRDT) + [y-webrtc](https://github.com/yjs/y-webrtc)
- **Markdown:** react-markdown

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

SyncPad uses **Yjs**, a high-performance CRDT (Conflict-free Replicated Data Type) implementation, to handle real-time collaboration. Here's the magic:

1. **CRDTs** — Every edit is converted into a conflict-free operation that can be applied in any order
2. **WebRTC** — Peers connect directly to each other (via signaling servers for discovery)
3. **Awareness** — User presence and cursors are synced separately from document content

### Signaling Servers

The app uses public Yjs signaling servers for peer discovery:
- `wss://signaling.yjs.dev`
- `wss://y-webrtc-signaling-eu.herokuapp.com`
- `wss://y-webrtc-signaling-us.herokuapp.com`

No document content passes through these servers — they only help peers find each other.

## 🎯 Use Cases

- **Brainstorming** — Jot down ideas together in real-time
- **Meeting Notes** — Collaborative note-taking during calls
- **Quick Sharing** — Share text snippets without creating accounts
- **Pair Programming** — Write pseudocode or documentation together
- **Teaching** — Live coding/writing demonstrations

## 📸 Screenshots

### Landing Page
Clean entry point with room creation and joining options.

### Editor View
Minimal editor with presence bar showing all collaborators.

### Markdown Preview
Toggle to see rendered markdown.

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit PRs

## 📄 License

MIT License — feel free to use this for your own projects!

---

Built with ❤️ using [Yjs](https://yjs.dev) for real-time collaboration.
