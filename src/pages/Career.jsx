import React from 'react'

const highlights = [
  {
    icon: '⚡',
    title: 'Build Fast',
    body: 'High-energy startup environment where ideas ship quickly and your work shapes how customers experience instant fashion.'
  },
  {
    icon: '🎯',
    title: 'Visible Impact',
    body: 'Work on real problems across fashion, tech, and operations—with direct ownership and measurable outcomes.'
  },
  {
    icon: '🤝',
    title: 'Collaborative Culture',
    body: 'Transparent, performance-driven teams that value initiative, clarity, and execution.'
  },
  {
    icon: '📈',
    title: 'Grow with Us',
    body: 'Competitive pay, growth-based incentives, and opportunities to take on big challenges early.'
  }
]

const opportunities = [
  'Operations & Inventory Management',
  'Fashion Buying & Merchandising',
  'Technology & Product Development',
  'Marketing, Growth & Brand',
  'Customer Support & Experience',
  'Delivery & Logistics Operations'
]

export default function Career() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-amber-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Header */}
        <header className="bg-white/90 border border-amber-100 shadow-lg shadow-amber-100/40 rounded-3xl p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-amber-700 uppercase">
            Careers at Doordripp
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold text-neutral-900 leading-tight">
            Build the Future of Instant Fashion
          </h1>
          <p className="mt-4 text-lg text-neutral-700 leading-relaxed">
            At Doordripp, we are building where style meets speed. If you love fashion, tech, ops, or crafting seamless customer experiences, join a team that moves fast and delivers impact.
          </p>
        </header>

        {/* Intro */}
        <section className="bg-white border border-neutral-100 rounded-2xl p-8 shadow-sm shadow-amber-100/40 space-y-4">
          <p className="text-neutral-700 leading-relaxed">
            We thrive on innovation, ownership, and execution. You will work in a high-energy environment where ideas matter, decisions move fast, and your work directly shapes how customers experience fashion—from in-house inventory and rapid deliveries to intuitive digital experiences and trend-forward collections.
          </p>
          <p className="text-neutral-700 leading-relaxed">
            We believe great teams create great products. Every role plays a key part in our success.
          </p>
        </section>

        {/* Highlights */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-neutral-900">Why Work With Us</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="bg-white border border-neutral-100 rounded-2xl p-8 shadow-sm shadow-amber-100/50 hover:shadow-md hover:border-amber-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl" aria-hidden="true">{item.icon}</span>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-neutral-900">{item.title}</h3>
                    <p className="text-neutral-700 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Opportunities */}
        <section className="bg-white border border-neutral-100 rounded-2xl p-8 shadow-sm shadow-amber-100/40">
          <h2 className="text-2xl font-extrabold text-neutral-900">Opportunities at Doordripp</h2>
          <p className="mt-3 text-neutral-700 leading-relaxed">
            We hire across multiple teams:
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {opportunities.map((role) => (
              <li key={role} className="flex items-start gap-2 text-neutral-800">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                <span>{role}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-8 sm:p-10 shadow-lg shadow-neutral-900/30 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold">📩 Join Us</h2>
          <p className="mt-4 text-lg text-neutral-100 leading-relaxed">
            Ready to move fast, think bold, and deliver style in minutes? We would love to hear from you.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=support@doordripp.com"
              className="px-8 py-3 bg-amber-500 text-neutral-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              Email Your Resume (support@doordripp.com)
            </a>
            <a
              href="/"
              className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Visit Our Website
            </a>
          </div>
          <p className="mt-4 text-sm text-neutral-200">
            Or apply through our website. Build fast. Think fashion. Deliver instantly.
          </p>
        </section>
      </div>
    </div>
  )
}
