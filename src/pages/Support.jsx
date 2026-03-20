import { useState, useCallback } from 'react'
import { Headphones, Mail, Phone, ChevronRight, ArrowLeft } from 'lucide-react'
import { createSupportTicket } from '../services/supportService'
import DrippyLogo from '../components/DrippyLogo'
import './Support.css'

/* ───────────────────────────────────────────
   Decision tree — Blinkit-style help flow
   Category → Sub-options → Resolution
   ─────────────────────────────────────────── */
const HELP_TREE = {
  root: {
    question: 'What do you need help with?',
    options: [
      { label: 'My Orders',         next: 'orders' },
      { label: 'Returns & Refunds', next: 'returns' },
      { label: 'Payments',          next: 'payments' },
      { label: 'Delivery',          next: 'delivery' },
      { label: 'Account & Login',   next: 'account' },
      { label: 'Something Else',    next: 'other' },
    ],
  },

  /* ── Orders ── */
  orders: {
    question: 'What about your order?',
    options: [
      { label: 'Where is my order?',       next: 'orders_track' },
      { label: 'I want to cancel my order', next: 'orders_cancel' },
      { label: 'Wrong item received',       next: 'orders_wrong' },
      { label: 'Item missing from order',   next: 'orders_missing' },
      { label: 'Go back',                   next: 'root', isBack: true },
    ],
  },
  orders_track: {
    answer: 'You can track your order from My Orders in your account. If it says "Shipped", the delivery partner is on the way. If it has been more than 48 hours since shipping, reach out to us below.',
    showContact: true,
  },
  orders_cancel: {
    answer: 'Orders can be cancelled within 1 hour of placing them. Go to My Orders and tap Cancel. If the option is not available, the order is already being processed — contact us and we will try our best.',
    showContact: true,
  },
  orders_wrong: {
    answer: 'We are sorry about that. Please reach out to us with your order details and a photo of the wrong item. We will arrange a replacement or refund immediately.',
    showContact: true,
  },
  orders_missing: {
    answer: 'If an item is missing from your order, please contact us within 48 hours of delivery. Keep the packaging handy for reference.',
    showContact: true,
  },

  /* ── Returns ── */
  returns: {
    question: 'What do you need help with?',
    options: [
      { label: 'How do returns work?',      next: 'returns_how' },
      { label: 'I want to exchange an item', next: 'returns_exchange' },
      { label: 'Refund not received',        next: 'returns_refund' },
      { label: 'Go back',                    next: 'root', isBack: true },
    ],
  },
  returns_how: {
    answer: 'We accept returns within 7 days of delivery for most items. The item must be unused with original tags. Go to My Orders, select the item, and tap "Return". A pickup will be scheduled within 24 hours.',
    showContact: true,
  },
  returns_exchange: {
    answer: 'Exchanges are available for size and colour changes. Start a return from My Orders and place a new order for the item you want. Your refund will be processed once we receive the returned item.',
    showContact: true,
  },
  returns_refund: {
    answer: 'Refunds are processed within 5-7 business days after we receive the returned item. If it has been longer, please contact us with your order ID.',
    showContact: true,
  },

  /* ── Payments ── */
  payments: {
    question: 'What is the issue?',
    options: [
      { label: 'Payment failed',           next: 'pay_failed' },
      { label: 'Charged twice',            next: 'pay_double' },
      { label: 'Payment methods accepted',  next: 'pay_methods' },
      { label: 'Go back',                  next: 'root', isBack: true },
    ],
  },
  pay_failed: {
    answer: 'If your payment failed, the amount (if deducted) will be refunded automatically within 3-5 business days. Try placing the order again. If the issue persists, try a different payment method or contact us.',
    showContact: true,
  },
  pay_double: {
    answer: 'If you were charged twice, do not worry — the duplicate charge will be reversed automatically within 5-7 business days. If not, contact us with your transaction reference.',
    showContact: true,
  },
  pay_methods: {
    answer: 'We accept UPI, all major credit and debit cards, net banking, wallets (Paytm, PhonePe), and Cash on Delivery for eligible orders.',
    showContact: false,
  },

  /* ── Delivery ── */
  delivery: {
    question: 'What do you need to know?',
    options: [
      { label: 'How long does delivery take?', next: 'del_time' },
      { label: 'Change delivery address',       next: 'del_address' },
      { label: 'Delivery charges',              next: 'del_charges' },
      { label: 'Go back',                       next: 'root', isBack: true },
    ],
  },
  del_time: {
    answer: 'Standard delivery takes 3-5 business days. Metro cities usually receive orders within 2-3 days. You will get tracking updates via SMS and email.',
    showContact: false,
  },
  del_address: {
    answer: 'You can change the delivery address before the order is shipped. Go to My Orders and tap "Edit Address". Once shipped, the address cannot be changed — contact us for help.',
    showContact: true,
  },
  del_charges: {
    answer: 'Delivery is free on orders above Rs 999. For orders below that, a flat delivery fee of Rs 49 applies.',
    showContact: false,
  },

  /* ── Account ── */
  account: {
    question: 'What is the trouble?',
    options: [
      { label: 'Forgot my password',    next: 'acc_password' },
      { label: 'Cannot log in',         next: 'acc_login' },
      { label: 'Delete my account',     next: 'acc_delete' },
      { label: 'Go back',               next: 'root', isBack: true },
    ],
  },
  acc_password: {
    answer: 'Tap "Forgot Password" on the login page and enter your registered email. You will receive a reset link within a few minutes. Check your spam folder if you do not see it.',
    showContact: false,
  },
  acc_login: {
    answer: 'Make sure you are using the correct email. If you signed up with Google, use "Sign in with Google". If nothing works, reach out to us and we will help you regain access.',
    showContact: true,
  },
  acc_delete: {
    answer: 'We are sad to see you go. To delete your account, please contact us from the email linked to your account. Account deletion is permanent and cannot be undone.',
    showContact: true,
  },

  /* ── Other ── */
  other: {
    answer: 'No worries — if your issue does not fit any category, just drop us a message below and a real human will get back to you.',
    showContact: true,
  },
}


export default function Support() {
  const [path, setPath] = useState(['root'])
  const [ticketStatus, setTicketStatus] = useState({ state: 'idle', message: '' })
  const [ticketForm, setTicketForm] = useState({ name: '', email: '', message: '' })

  const currentKey = path[path.length - 1]
  const currentNode = HELP_TREE[currentKey]

  const goTo = (key) => setPath(prev => [...prev, key])
  const goBack = () => setPath(prev => prev.length > 1 ? prev.slice(0, -1) : prev)
  const resetFlow = () => setPath(['root'])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    setTicketStatus({ state: 'loading', message: '' })
    try {
      const result = await createSupportTicket({ ...ticketForm })
      if (result?.ok) {
        setTicketStatus({ state: 'success', message: 'Got it. A human is on it — expect a reply shortly.' })
        setTicketForm({ name: '', email: '', message: '' })
      } else {
        setTicketStatus({ state: 'error', message: 'Something went wrong. Please try again.' })
      }
    } catch {
      setTicketStatus({ state: 'error', message: 'Something went wrong. Please try again.' })
    }
  }, [ticketForm])

  const isOptions = !!currentNode?.options
  const isAnswer  = !!currentNode?.answer

  return (
    <section className="support-page min-h-screen pt-24 pb-16">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="support-column">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Headphones className="h-4 w-4" />
              Always-on Support
            </div>
            <h1 className="support-font mt-5 text-4xl md:text-5xl font-semibold text-slate-900">
              DoorDripp Help Desk
              <span className="block text-slate-500">Human care, chat speed.</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-xl">
              Pick your issue, drill down, and Drippy will guide you to the answer — or connect you with the team.
            </p>

            {/* Contact form */}
            <div className="support-panel mt-8 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-700" />
                <h3 className="support-font text-lg font-semibold text-slate-900">Contact support</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">Robots not cutting it? Drop us a line — a real, coffee-fueled human will reply within 24 hours.</p>

              <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="floating-field">
                    <input
                      className="floating-input peer"
                      placeholder=" "
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, name: e.target.value }))}
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
                      onChange={(e) => setTicketForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                    <span className="floating-label">Email</span>
                  </label>
                </div>

                <label className="floating-field floating-field-textarea">
                  <textarea
                    className="floating-input floating-textarea peer"
                    placeholder=" "
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
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

          {/* ── RIGHT COLUMN — Decision Tree Panel ── */}
          <div className="support-column">
            <div className="support-panel chat-shell rounded-3xl p-6">

              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <DrippyLogo size={28} />
                <div>
                  <p className="support-font text-lg font-semibold text-slate-900">Drippy</p>
                  <p className="text-xs text-slate-400">Your support sidekick</p>
                </div>
              </div>

              {/* Flow content */}
              <div className="mt-5 min-h-[320px]">

                {/* Options screen */}
                {isOptions && (
                  <div className="animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                    <p className="text-sm font-semibold text-slate-700 mb-4">{currentNode.question}</p>
                    <div className="grid gap-2">
                      {currentNode.options.map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => opt.isBack ? goBack() : goTo(opt.next)}
                          className={`w-full text-left px-4 py-3 border text-sm font-medium transition-all duration-150 flex items-center justify-between ${
                            opt.isBack
                              ? 'border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                              : 'border-slate-200 text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white'
                          }`}
                          style={{ borderRadius: 0 }}
                        >
                          <span className="flex items-center gap-2">
                            {opt.isBack && <ArrowLeft className="h-3.5 w-3.5" />}
                            {opt.label}
                          </span>
                          {!opt.isBack && <ChevronRight className="h-4 w-4 opacity-40" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Answer screen */}
                {isAnswer && (
                  <div className="animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                    {/* Drippy's response bubble */}
                    <div className="bg-slate-50 border border-slate-200 p-4 mb-5" style={{ borderRadius: 0 }}>
                      <p className="text-sm text-slate-700 leading-relaxed">{currentNode.answer}</p>
                    </div>

                    {/* Contact options if needed */}
                    {currentNode.showContact && (
                      <div className="space-y-3 mb-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Still need help?</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <a
                            href="mailto:support@doordripp.com"
                            className="flex items-center gap-2 px-4 py-3 border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-150"
                            style={{ borderRadius: 0 }}
                          >
                            <Mail className="h-4 w-4" />
                            Email us
                          </a>
                          <a
                            href="tel:+919876543210"
                            className="flex items-center gap-2 px-4 py-3 border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-150"
                            style={{ borderRadius: 0 }}
                          >
                            <Phone className="h-4 w-4" />
                            Call us
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={goBack}
                        className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={resetFlow}
                        className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        Start over
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-400 text-center">
              Guided help flows — no bots, no runaround.
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
