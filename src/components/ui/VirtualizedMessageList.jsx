import { memo, useEffect, useRef } from 'react'

const ITEM_HEIGHT = 80 // Approximate height of each message + spacing

import { Sparkles, User } from 'lucide-react'

const MessageItem = memo(({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div className={`flex w-full mb-6 px-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="shrink-0 h-8 w-8 rounded-lg bg-[#3b82f6] shadow-sm flex items-center justify-center mr-3 mt-auto">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}

      <div
        className={`relative max-w-[75%] px-4 py-3 text-[14.5px] leading-relaxed transition-all duration-300 animate-in fade-in slide-in-from-bottom-2
          ${isUser
            ? 'bg-[#1e293b] text-white rounded-2xl rounded-br-sm shadow-md'
            : 'bg-[#f8fafc] text-slate-700 rounded-2xl rounded-bl-sm border border-slate-100'
          }`}
      >
        <div className="break-words font-medium">
          {message.text}
        </div>
      </div>

      {isUser && (
        <div className="shrink-0 h-8 w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center ml-3 mt-auto overflow-hidden">
          <User className="h-5 w-5 text-slate-500" />
        </div>
      )}
    </div>
  )
}, (prev, next) => prev.message.id === next.message.id)

MessageItem.displayName = 'MessageItem'

const TypingIndicator = memo(() => (
  <div className="flex w-full mb-6 px-4 justify-start">
    <div className="shrink-0 h-8 w-8 rounded-lg bg-[#3b82f6] shadow-sm flex items-center justify-center mr-3 mt-auto">
      <Sparkles className="h-4 w-4 text-white" />
    </div>
    <div className="relative max-w-[75%] px-4 py-4 bg-[#f8fafc] text-slate-700 rounded-2xl rounded-bl-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-2 flex items-center">
      <div className="flex gap-1.5 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
))

TypingIndicator.displayName = 'TypingIndicator'

export default memo(function VirtualizedMessageList({ messages, isTyping, scrollRef }) {
  return (
    <div ref={scrollRef} className="mt-2 h-[450px] overflow-y-auto w-full">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      {isTyping && <TypingIndicator />}
    </div>
  )
}, (prev, next) => {
  // Custom comparison: only re-render if messages changed or typing state changed
  return (
    prev.messages === next.messages &&
    prev.isTyping === next.isTyping
  )
})
