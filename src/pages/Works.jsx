import React from 'react'
import { Link } from 'react-router-dom'

const steps = [
  {
    icon: '🧭',
    title: 'Browse Ready-to-Wear Fashion',
    body: 'Explore a curated selection of clothes, footwear, and accessories on the Doordripp app or website. Every product you see is already stocked at Doordripp\'s own facility, ensuring instant availability and zero waiting.'
  },
  {
    icon: '🎨',
    title: 'Select Your Style',
    body: 'Choose your preferred size, color, and design with clear product details. Doordripp focuses on high-demand, ready-to-wear fashion, making it easy to find the perfect outfit for last-minute plans, work, travel, or special occasions.'
  },
  {
    icon: '⚡',
    title: 'Fast & Secure Checkout',
    body: 'Complete your order in just a few clicks using UPI, debit/credit cards, or cash on delivery (available in select areas). Our streamlined checkout is built for speed and convenience.'
  },
  {
    icon: '🏭',
    title: 'Instant In-House Order Processing',
    body: 'Once the order is placed, it is immediately processed from Doordripp\'s in-stock inventory. Since we manage our own stock, there are no delays from third-party sellers or external warehouses.'
  },
  {
    icon: '🧵',
    title: 'Quick Quality Inspection',
    body: 'Each item undergoes a rapid in-house quality check to verify size, color, and condition. This ensures every product reaches you clean, accurate, and ready to wear.'
  },
  {
    icon: '📦',
    title: 'Secure Packing & Immediate Dispatch',
    body: 'Orders are packed carefully using minimal, eco-friendly packaging. A nearby delivery partner is assigned right away, allowing dispatch within minutes of order confirmation.'
  },
  {
    icon: '📡',
    title: 'Live Order Tracking',
    body: 'Track your order in real time from dispatch to doorstep. Live updates and a delivery countdown keep you informed every step of the way.'
  },
  {
    icon: '⏱️',
    title: '20–40 Minute Doorstep Delivery',
    body: 'With inventory ready at our location and optimized delivery routes, Doordripp delivers your fashion essentials within 20–40 minutes.'
  },
  {
    icon: '🔁',
    title: 'Easy Returns & Quick Exchanges',
    body: 'If the fit or style is not right, request a return or exchange directly through the app. Our simple and hassle-free process puts customer comfort first.'
  },
  {
    icon: '✨',
    title: 'Style That Keeps Coming Back',
    body: 'After delivery, enjoy personalized recommendations, exclusive drops, and special offers — making every future Doordripp order faster, smarter, and more relevant.'
  }
]

export default function Works() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-amber-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Header */}
        <header className="bg-white/90 border border-amber-100 shadow-lg shadow-amber-100/40 rounded-3xl p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-amber-700 uppercase">
            Works
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold text-neutral-900 leading-tight">
            How DOORDRIPP Works
          </h1>
          <p className="mt-4 text-lg text-neutral-700 leading-relaxed">
            This is how Doordripp delivers fashion — fast, reliable, and ready when you need it.
          </p>
        </header>

        {/* Steps */}
        <section className="grid gap-6 lg:grid-cols-2">
          {steps.map((step) => (
            <div
              key={step.title}
              className="bg-white border border-neutral-100 rounded-2xl p-8 shadow-sm shadow-amber-100/50 hover:shadow-md hover:border-amber-200 transition-all"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl" aria-hidden="true">{step.icon}</span>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-neutral-900">{step.title}</h3>
                  <p className="text-neutral-700 leading-relaxed">{step.body}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-8 sm:p-10 shadow-lg shadow-neutral-900/30 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to experience 20–40 minute fashion?</h2>
          <p className="mt-4 text-lg text-neutral-200">
            Browse, check out, track, and wear. Doordripp brings ready-to-wear looks to your door in minutes.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="px-8 py-3 bg-amber-500 text-neutral-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
