import { memo, useEffect, useRef } from 'react'

const ITEM_HEIGHT = 80 // Approximate height of each message + spacing

const MessageItem = memo(({ message }) => (
  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`chat-bubble ${message.role}`}>
      <p className="text-sm leading-relaxed">{message.text}</p>
    </div>
  </div>
), (prev, next) => prev.message.id === next.message.id)

MessageItem.displayName = 'MessageItem'

const TypingIndicator = memo(() => (
  <div className="flex justify-start">
    <div className="typing-bubble">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  </div>
))

TypingIndicator.displayName = 'TypingIndicator'

export default memo(function VirtualizedMessageList({ messages, isTyping, scrollRef }) {
  return (
    <div ref={scrollRef} className="mt-6 h-[420px] overflow-y-auto space-y-4 pr-2">
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
