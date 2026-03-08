import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Headphones, Mail, MessageSquare, ShieldCheck, Sparkles, Timer } from 'lucide-react'
import { createSupportTicket, fetchSupportFaqs, sendSupportMessage } from '../services/supportService'
import { useAuth } from '../context/AuthContext'
import VirtualizedMessageList from '../components/ui/VirtualizedMessageList'
import './Support.css'

const LANGUAGE_META = {
  en: {
    label: 'English',
    greeting: "Hi! I'm Dripp Assist. Ask me about orders, returns, or payments.",
    placeholder: 'Ask a question or pick a quick reply...',
    contactTitle: 'Contact support',
    contactCopy: 'Need a human? Leave a note and we will reply within 24 hours.'
  },
  hi: {
    label: 'Hindi (Roman)',
    greeting: 'Namaste! Main Dripp Assist hu. Orders, returns ya payments ke bare me puchiye.',
    placeholder: 'Sawal likhiye ya quick reply select kare...',
    contactTitle: 'Contact support',
    contactCopy: 'Human help chahiye? Yaha message chhodiye, 24 hours me reply milega.'
  }
}

const QUICK_STATS = [
  { icon: Timer, label: 'Avg response', value: 'Under 2 min' },
  { icon: ShieldCheck, label: 'Resolution rate', value: '94%' },
  { icon: MessageSquare, label: 'Daily chats', value: '2.4k+' }
]

const faqCache = {}

export default function Support() {
  const { user } = useAuth()
  const [language, setLanguage] = useState(sessionStorage.getItem('supportLang') || 'en')
  const [faqs, setFaqs] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [quickReplies, setQuickReplies] = useState([])
  const [ticketStatus, setTicketStatus] = useState({ state: 'idle', message: '' })
  const [ticketForm, setTicketForm] = useState({ name: '', email: '', orderId: '', message: '' })
  const scrollRef = useRef(null)
  const saveDebounce = useRef(null)

  const meta = LANGUAGE_META[language] || LANGUAGE_META.en
  const storageKey = `supportChatHistory:${language}`

  useEffect(() => {
    sessionStorage.setItem('supportLang', language)
  }, [language])

  useEffect(() => {
    let isMounted = true

    const loadFaqs = async () => {
      // Check cache first
      if (faqCache[language]) {
        if (isMounted) {
          setFaqs(faqCache[language])
        }
        return
      }

      try {
        const data = await fetchSupportFaqs(language)
        if (!isMounted) return
        const faqList = data.faqs || []
        // Cache FAQs for current language
        faqCache[language] = faqList
        setFaqs(faqList)
      } catch (err) {
        if (!isMounted) return
        setFaqs([])
      }
    }

    loadFaqs()

    return () => {
      isMounted = false
    }
  }, [language])

  // Debounced sessionStorage save
  useEffect(() => {
    // Clear previous timeout
    if (saveDebounce.current) {
      clearTimeout(saveDebounce.current)
    }

    // Debounce the save by 1 second
    saveDebounce.current = setTimeout(() => {
      sessionStorage.setItem(storageKey, JSON.stringify(messages))
    }, 1000)

    return () => {
      if (saveDebounce.current) {
        clearTimeout(saveDebounce.current)
      }
    }
  }, [messages, storageKey])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

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

    setMessages([
      {
        id: `${Date.now()}-greeting`,
        role: 'bot',
        text: meta.greeting
      }
    ])
  }, [storageKey, meta.greeting])

  const defaultQuickReplies = useMemo(() => {
    return faqs.slice(0, 6).map(faq => faq.question)
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
      appendMessage('bot', 'Sorry, something went wrong. Please try again or use Contact Support below.')
      setQuickReplies([])
    } finally {
      setIsTyping(false)
    }
  }, [language, appendMessage, user])

  const handleQuickReply = useCallback((question) => {
    handleSend(question)
  }, [handleSend])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    setTicketStatus({ state: 'loading', message: '' })

    try {
      const payload = { ...ticketForm, language }
      const result = await createSupportTicket(payload)
      if (result?.ok) {
        setTicketStatus({ state: 'success', message: 'Ticket created. Our team will reach out shortly.' })
        setTicketForm({ name: '', email: '', orderId: '', message: '' })
      } else {
        setTicketStatus({ state: 'error', message: 'Unable to submit. Please try again.' })
      }
    } catch (err) {
      setTicketStatus({ state: 'error', message: 'Unable to submit. Please try again.' })
    }
  }, [ticketForm, language])

  const handleClearChat = useCallback(() => {
    setMessages([{ id: `${Date.now()}-greeting`, role: 'bot', text: meta.greeting }])
    setQuickReplies([])
  }, [meta.greeting])

  return (
    <section className="support-page min-h-screen pt-24 pb-16">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="support-column">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Always-on Support
            </div>
            <h1 className="support-font mt-5 text-4xl md:text-5xl font-semibold text-slate-900">
              Doordripp Help Desk
              <span className="block text-slate-500">Human care, chat speed.</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-xl">
              Ask anything about orders, returns, payments, or delivery. Dripp Assist responds instantly and routes you to human support when needed.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {QUICK_STATS.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <stat.icon className="h-5 w-5 text-slate-700" />
                  <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
                  <p className="support-font text-lg font-semibold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="support-panel mt-8 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Headphones className="h-5 w-5 text-slate-700" />
                <h3 className="support-font text-lg font-semibold text-slate-900">{meta.contactTitle}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">{meta.contactCopy}</p>

              <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="floating-field">
                    <input
                      className="floating-input peer"
                      placeholder=" "
                      value={ticketForm.name}
                      onChange={(event) => setTicketForm(prev => ({ ...prev, name: event.target.value }))}
                      required
                    />
                    <span className="floating-label">Your name</span>
                  </label>
                  <label className="floating-field">
                    <input
                      className="floating-input peer"
                      type="email"
                      placeholder=" "
                      value={ticketForm.email}
                      onChange={(event) => setTicketForm(prev => ({ ...prev, email: event.target.value }))}
                      required
                    />
                    <span className="floating-label">Email</span>
                  </label>
                </div>
                <label className="floating-field">
                  <input
                    className="floating-input peer"
                    placeholder=" "
                    value={ticketForm.orderId}
                    onChange={(event) => setTicketForm(prev => ({ ...prev, orderId: event.target.value }))}
                  />
                  <span className="floating-label">Order ID (optional)</span>
                </label>
                <label className="floating-field floating-field-textarea">
                  <textarea
                    className="floating-input floating-textarea peer"
                    placeholder=" "
                    value={ticketForm.message}
                    onChange={(event) => setTicketForm(prev => ({ ...prev, message: event.target.value }))}
                    required
                  />
                  <span className="floating-label">Tell us what happened</span>
                </label>

                <button
                  className="support-btn flex items-center gap-2"
                  type="submit"
                  disabled={ticketStatus.state === 'loading'}
                >
                  <Mail className="h-4 w-4" />
                  {ticketStatus.state === 'loading' ? 'Submitting...' : 'Send to Support'}
                </button>

                {ticketStatus.state !== 'idle' && (
                  <p className={`text-sm ${ticketStatus.state === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {ticketStatus.message}
                  </p>
                )}
              </form>
            </div>
          </div>

          <div className="support-column">
            <div className="support-panel chat-shell rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="support-font text-lg font-semibold text-slate-900">Dripp Assist</p>
                  <p className="text-xs text-emerald-600">Online now</p>
                </div>
                <select
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                >
                  {Object.entries(LANGUAGE_META).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>

              <VirtualizedMessageList 
                messages={messages} 
                isTyping={isTyping} 
                scrollRef={scrollRef} 
              />

              <div className="mt-5 flex flex-wrap gap-2">
                {visibleQuickReplies.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="quick-chip"
                    onClick={() => handleQuickReply(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <label className="floating-field floating-field-textarea">
                  <textarea
                    className="floating-input floating-textarea peer"
                    placeholder=" "
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                  />
                  <span className="floating-label">{meta.placeholder}</span>
                </label>
                <div className="flex items-center justify-between">
                  <button
                    className="text-sm text-slate-500 hover:text-slate-700"
                    type="button"
                    onClick={handleClearChat}
                  >
                    Clear chat
                  </button>
                  <button
                    className="support-btn"
                    type="button"
                    onClick={() => handleSend(input)}
                  >
                    Send message
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="h-4 w-4 text-slate-400" />
              Powered by predefined help flows. For account-sensitive issues, use Contact Support.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
