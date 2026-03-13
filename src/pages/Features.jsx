import React from 'react'

export default function Features() {
  const features = [
    {
      icon: '🚀',
      title: 'Fashion Delivered in 20–40 Minutes',
      description: 'No waiting. No planning ahead. Doordripp brings clothes, footwear, and accessories straight to your door in as little as 20 minutes, powered by hyperlocal fashion hubs and lightning-fast delivery partners.'
    },
    {
      icon: '👗',
      title: 'Everything Fashion. One Platform.',
      description: 'From everyday essentials to last-minute outfits: Clothing, Footwear, Accessories. One app. One checkout. Zero hassle.',
      subItems: ['Clothing – casual, party, ethnic, office, streetwear', 'Footwear – sneakers, heels, formals, sports shoes', 'Accessories – watches, bags, belts, sunglasses & more']
    },
    {
      icon: '🏙️',
      title: 'Hyperlocal Fashion Hubs',
      description: 'We don\'t ship from faraway warehouses. Doordripp uses city-based micro style hubs, stocked with trending items near you — enabling faster delivery and fresher fashion.'
    },
    {
      icon: '🧠',
      title: 'Smart Style Suggestions',
      description: 'Not sure what to wear? We\'ve got you.',
      subItems: ['Instant outfit suggestions by occasion & trend', '"Style Now" picks complete looks in seconds', 'Daily updated trending styles — not outdated catalogs']
    },
    {
      icon: '⏱️',
      title: 'Live Delivery Tracking',
      description: 'Full transparency from click to doorstep:',
      subItems: ['Order packed instantly', 'Rider dispatched in minutes', 'Live countdown till arrival', 'You always know when your drip arrives.']
    },
    {
      icon: '🧵',
      title: 'Quality-Checked Before Dispatch',
      description: 'Every order goes through a quick inspection:',
      subItems: ['Correct size & color', 'Damage-free & wearable condition', 'Secure, minimal packaging', 'Arrives ready to wear — not ready to return.']
    },
    {
      icon: '🔁',
      title: 'Easy Returns & Quick Swaps',
      description: 'Didn\'t like the fit? Simple exchange & return flow with fast pickup support and customer-first assistance. Because fast fashion should also be easy fashion.'
    },
    {
      icon: '💳',
      title: 'Fast & Flexible Payments',
      description: 'Pay your way:',
      subItems: ['UPI (GPay, PhonePe, Paytm)', 'Debit / Credit Cards', 'Cash on Delivery (select areas)', 'Checkout in seconds.']
    },
    {
      icon: '🎁',
      title: 'Flash Drops & Limited Drips',
      description: 'Exclusive to Doordripp:',
      subItems: ['Time-limited fashion drops', 'City-exclusive styles', 'Countdown deals you don\'t want to miss', 'Once it\'s gone — it\'s gone.']
    },
    {
      icon: '🌱',
      title: 'Built for a Smarter Future',
      description: 'Shorter delivery routes = lower emissions. Local sourcing supports nearby sellers. Minimal, eco-friendly packaging. Fast fashion, done responsibly.'
    }
  ]

  const whyChoose = [
    'Fashion in 20–40 minutes',
    'Clothes, footwear & accessories in one place',
    'Smart styling, not endless scrolling',
    'Hyperlocal, fast & reliable'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-amber-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Header */}
        <header className="bg-white/90 border border-amber-100 shadow-lg shadow-amber-100/40 rounded-3xl p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-amber-700 uppercase">
            Features
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold text-neutral-900 leading-tight">
            What Makes DOORDRIPP Different
          </h1>
          <p className="mt-4 text-lg text-neutral-700 leading-relaxed">
            Discover the features that make DOORDRIPP India's fastest wardrobe rescue platform.
          </p>
        </header>

        {/* Features Grid */}
        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {features.map((feature, index) => (
              <div key={index} className="bg-white border border-neutral-100 rounded-2xl p-8 shadow-sm shadow-amber-100/50 hover:shadow-md hover:border-amber-200 transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{feature.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-neutral-900">{feature.title}</h3>
                    <p className="mt-3 text-neutral-700 leading-relaxed">
                      {feature.description}
                    </p>
                    {feature.subItems && (
                      <ul className="mt-4 space-y-2">
                        {feature.subItems.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 text-neutral-700">
                            <span className="text-amber-500 font-bold mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-8 sm:p-10 shadow-lg shadow-neutral-900/30">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Why Choose DOORDRIPP?</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {whyChoose.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-amber-500">
                  <svg className="w-5 h-5 text-neutral-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg text-neutral-100">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white border border-neutral-100 rounded-2xl p-8 sm:p-10 shadow-sm shadow-amber-100/40 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            Your Style. Delivered Instantly.
          </h2>
          <p className="mt-4 text-lg text-neutral-700">
            Experience the future of fashion today. Download DOORDRIPP and get your first order in minutes.
          </p>
          <div className="mt-8 flex justify-center">
            <button className="px-8 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors">
              Download Now
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
