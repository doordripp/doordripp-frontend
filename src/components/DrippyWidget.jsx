import { useState } from 'react'
import { Mail, Phone, ChevronRight, ArrowLeft, X } from 'lucide-react'
import DrippyLogo from './DrippyLogo'

/* ───────────────────────────────────────────
   Decision tree — same as Support page
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
    answer: 'Orders can be cancelled within 1 hour of placing them. Go to My Orders and tap Cancel. If the option is not available, the order is already being processed.',
    showContact: true,
  },
  orders_wrong: {
    answer: 'We are sorry about that. Please reach out with your order details and a photo of the wrong item. We will arrange a replacement or refund.',
    showContact: true,
  },
  orders_missing: {
    answer: 'If an item is missing, please contact us within 48 hours of delivery. Keep the packaging handy.',
    showContact: true,
  },
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
    answer: 'We accept returns within 7 days of delivery. The item must be unused with original tags. Go to My Orders, select the item, and tap "Return".',
    showContact: false,
  },
  returns_exchange: {
    answer: 'Exchanges are available for size and colour changes. Start a return and place a new order. Refund processes once we receive the returned item.',
    showContact: true,
  },
  returns_refund: {
    answer: 'Refunds are processed within 5-7 business days after we receive the returned item. If longer, contact us with your order ID.',
    showContact: true,
  },
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
    answer: 'If your payment failed, the amount will be refunded automatically within 3-5 business days. Try a different payment method or contact us.',
    showContact: true,
  },
  pay_double: {
    answer: 'Duplicate charges are reversed automatically within 5-7 business days. If not, contact us with your transaction reference.',
    showContact: true,
  },
  pay_methods: {
    answer: 'We accept UPI, all major credit/debit cards, net banking, wallets (Paytm, PhonePe), and Cash on Delivery for eligible orders.',
    showContact: false,
  },
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
    answer: 'Standard delivery takes 3-5 business days. Metro cities usually get orders within 2-3 days.',
    showContact: false,
  },
  del_address: {
    answer: 'You can change the delivery address before shipment from My Orders. Once shipped, contact us for help.',
    showContact: true,
  },
  del_charges: {
    answer: 'Delivery is free on orders above Rs 999. Below that, a flat Rs 49 fee applies.',
    showContact: false,
  },
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
    answer: 'Tap "Forgot Password" on the login page and enter your email. Check spam if you do not see the reset link.',
    showContact: false,
  },
  acc_login: {
    answer: 'Make sure you are using the correct email. If you signed up with Google, use "Sign in with Google". Otherwise, reach out to us.',
    showContact: true,
  },
  acc_delete: {
    answer: 'To delete your account, contact us from the email linked to your account. This is permanent and cannot be undone.',
    showContact: true,
  },
  other: {
    answer: 'No worries — drop us a message and a real human will get back to you.',
    showContact: true,
  },
}


export default function DrippyWidget({ isOpen, onClose }) {
  const [path, setPath] = useState(['root'])

  const currentKey = path[path.length - 1]
  const currentNode = HELP_TREE[currentKey]

  const goTo = (key) => setPath(prev => [...prev, key])
  const goBack = () => setPath(prev => prev.length > 1 ? prev.slice(0, -1) : prev)
  const resetFlow = () => setPath(['root'])

  const isOptions = !!currentNode?.options
  const isAnswer  = !!currentNode?.answer

  if (!isOpen) return null

  return (
    <div
      className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col bg-white border border-slate-200 shadow-2xl overflow-hidden"
      style={{ borderRadius: 0, maxHeight: 'min(450px, 65vh)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#6E6E6E] text-white shrink-0">
        <div className="flex items-center gap-2.5">
          <DrippyLogo size={24} />
          <div>
            <p className="text-sm font-bold tracking-wide">Drippy</p>
            <p className="text-[10px] text-white/60">Your support sidekick</p>
          </div>
        </div>
        <button
          onClick={() => { onClose(); resetFlow() }}
          className="w-7 h-7 flex items-center justify-center hover:bg-white/20 transition-colors"
          style={{ borderRadius: 0 }}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ minHeight: 0 }}>

        {/* Options screen */}
        {isOptions && (
          <div className="animate-fade-in-up" style={{ animationDuration: '200ms' }}>
            <p className="text-xs font-semibold text-slate-500 mb-3">{currentNode.question}</p>
            <div className="grid gap-1.5">
              {currentNode.options.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => opt.isBack ? goBack() : goTo(opt.next)}
                  className={`w-full text-left px-3 py-2.5 border text-[13px] font-medium transition-all duration-150 flex items-center justify-between ${
                    opt.isBack
                      ? 'border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                      : 'border-slate-200 text-slate-700 hover:border-[#BAFF39] hover:bg-[#BAFF39]/10'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  <span className="flex items-center gap-2">
                    {opt.isBack && <ArrowLeft className="h-3 w-3" />}
                    {opt.label}
                  </span>
                  {!opt.isBack && <ChevronRight className="h-3.5 w-3.5 opacity-30" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Answer screen */}
        {isAnswer && (
          <div className="animate-fade-in-up" style={{ animationDuration: '200ms' }}>
            <div className="bg-slate-50 border border-slate-200 p-3 mb-4" style={{ borderRadius: 0 }}>
              <p className="text-[13px] text-slate-700 leading-relaxed">{currentNode.answer}</p>
            </div>

            {currentNode.showContact && (
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Still need help?</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <a
                    href="mailto:support@doordripp.com"
                    className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 text-[12px] font-semibold text-slate-600 hover:border-[#BAFF39] hover:bg-[#BAFF39]/10 transition-all"
                    style={{ borderRadius: 0 }}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email us
                  </a>
                  <a
                    href="tel:+919876543210"
                    className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 text-[12px] font-semibold text-slate-600 hover:border-[#BAFF39] hover:bg-[#BAFF39]/10 transition-all"
                    style={{ borderRadius: 0 }}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call us
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goBack}
                className="text-[12px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </button>
              <button
                type="button"
                onClick={resetFlow}
                className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 py-2 border-t border-slate-100 bg-slate-50">
        <a
          href="/support"
          className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
        >
          Open full help desk
        </a>
      </div>
    </div>
  )
}
