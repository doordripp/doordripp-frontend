import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MessageSquare, X, Send, Sparkles } from 'lucide-react'
import { sendSupportMessage, fetchSupportFaqs } from '../../services/supportService'
import { useAuth } from '../../context/AuthContext'
import VirtualizedMessageList from '../ui/VirtualizedMessageList'
import './FloatingDrippAssist.css'

const LANGUAGE_META = {
  en: {
    label: 'English',
    greeting: "Hi! I'm Dripp Assist. Ask me about orders, returns, or payments.",
    placeholder: 'Ask a question...'
  },
  hi: {
    label: 'Hindi',
    greeting: 'Namaste! Main Dripp Assist hu. Orders, returns ya payments ke bare me puchiye.',
    placeholder: 'Sawal likhiye...'
  }
}

const faqCache = {}

export default function FloatingDrippAssist() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState(sessionStorage.getItem('supportLang') || 'en')
  const [faqs, setFaqs] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [quickReplies, setQuickReplies] = useState([])
  const scrollRef = useRef(null)
  const saveDebounce = useRef(null)

  const meta = LANGUAGE_META[language] || LANGUAGE_META.en
  const storageKey = `floatingChatHistory:${language}`

  useEffect(() => {
    sessionStorage.setItem('supportLang', language)
  }, [language])

  useEffect(() => {
    let isMounted = true
    const loadFaqs = async () => {
      if (faqCache[language]) {
        if (isMounted) setFaqs(faqCache[language])
        return
      }
      try {
        const data = await fetchSupportFaqs(language)
        if (!isMounted) return
        const faqList = data.faqs || []
        faqCache[language] = faqList
        setFaqs(faqList)
      } catch (err) {
        if (!isMounted) return
        setFaqs([])
      }
    }
    loadFaqs()
    return () => { isMounted = false }
  }, [language])

  useEffect(() => {
    if (saveDebounce.current) clearTimeout(saveDebounce.current)
    saveDebounce.current = setTimeout(() => {
      sessionStorage.setItem(storageKey, JSON.stringify(messages))
    }, 1000)
    return () => {
      if (saveDebounce.current) clearTimeout(saveDebounce.current)
    }
  }, [messages, storageKey])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping, isOpen])

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setMessages(Array.isArray(parsed) ? parsed : [])
        return
      } catch (err) {
        setMessages([])
      }
    }
    setMessages([{ id: `${Date.now()}-greeting`, role: 'bot', text: meta.greeting }])
  }, [storageKey, meta.greeting])

  const defaultQuickReplies = useMemo(() => {
    return faqs.slice(0, 4).map(faq => faq.question)
  }, [faqs])

  const visibleQuickReplies = quickReplies.length ? quickReplies : defaultQuickReplies

  const appendMessage = useCallback((role, text) => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text }])
  }, [])

  const handleSend = useCallback(async (payloadText) => {
    const text = payloadText.trim()
    if (!text) return

    appendMessage('user', text)
    setInput('')
    setIsTyping(true)

    try {
      const response = await sendSupportMessage(text, language, null, user?._id)
      appendMessage('bot', response.reply)
      setQuickReplies(response.quickReplies || [])
    } catch (err) {
      appendMessage('bot', 'Sorry, I am having trouble right now. Please try again later.')
      setQuickReplies([])
    } finally {
      setIsTyping(false)
    }
  }, [language, appendMessage, user])

  const handleQuickReply = useCallback((question) => {
    handleSend(question)
  }, [handleSend])

  const handleClearChat = useCallback(() => {
    setMessages([{ id: `${Date.now()}-greeting`, role: 'bot', text: meta.greeting }])
    setQuickReplies([])
  }, [meta.greeting])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="floating-assist-toggle"
        aria-label="Open Dripp Assist"
      >
        <span className="relative flex h-full w-full items-center justify-center">
          <MessageSquare className="h-6 w-6 text-white" />
        </span>
      </button>
    )
  }

  return (
    <div className="floating-assist-container">
      <div className="bg-white border-b border-gray-100 flex items-center justify-between p-4 pb-2 z-10 relative">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#3b82f6] flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-[15px]">Dripp Support</span>
        </div>

        <div className="flex items-center gap-1.5">
          <select
            className="text-[12px] font-medium bg-transparent text-gray-500 cursor-pointer focus:outline-none py-1 px-1 rounded transition-colors"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {Object.entries(LANGUAGE_META).map(([key, value]) => (
              <option key={key} value={key} className="bg-white text-gray-800">{value.label}</option>
            ))}
          </select>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="floating-assist-messages">
        <VirtualizedMessageList
          messages={messages}
          isTyping={isTyping}
          scrollRef={scrollRef}
        />

        {visibleQuickReplies.length > 0 && (
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            {visibleQuickReplies.map((item) => (
              <button
                key={item}
                type="button"
                className="quick-reply-btn text-[13px] px-3.5 py-2 rounded-full font-medium text-left"
                onClick={() => handleQuickReply(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white">
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="flex-1 bg-transparent border-none px-0 py-2 text-[15px] focus:outline-none placeholder:text-slate-300 text-slate-800"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          />
          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            <button
              onClick={handleClearChat}
              className="text-[12px] font-medium text-gray-400 hover:text-gray-700 transition-colors px-2 py-1.5 rounded-md hover:bg-gray-100"
              title="Clear Chat"
            >
              Clear
            </button>
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
              className="h-9 w-9 rounded-full bg-[#111827] text-white hover:bg-black disabled:opacity-50 disabled:bg-[#111827] transition-colors flex items-center justify-center shrink-0 pr-0.5"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
