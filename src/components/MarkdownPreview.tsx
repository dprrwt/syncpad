import Markdown from 'react-markdown'

interface MarkdownPreviewProps {
  content: string
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No content to preview</p>
          <p className="text-xs text-slate-600 mt-1">Switch to edit mode and start typing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="markdown-preview max-w-3xl mx-auto">
        <Markdown>{content}</Markdown>
      </div>
    </div>
  )
}
