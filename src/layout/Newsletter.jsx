import { useState } from 'react'
import { Mail } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      console.log('Newsletter subscription:', email)
      setIsSubmitted(true)
      setEmail('')
      setTimeout(() => setIsSubmitted(false), 3000)
    }
  }

  return (
    <section className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-black py-12 lg:py-16">
      {/* Thin top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-neutral-700" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left */}
          <div className="lg:max-w-md">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Stay in the loop</p>
            <h3 className="text-2xl font-black text-white md:text-3xl lg:text-4xl uppercase leading-tight tracking-tight">
              STAY UPTO DATE ABOUT OUR LATEST OFFERS
            </h3>
            <div className="mt-4 w-10 h-0.5 bg-neutral-600" />
          </div>

          {/* Right — Form */}
          <div className="lg:max-w-sm w-full">
            {isSubmitted ? (
              <div className="border border-green-700 bg-green-900/30 px-6 py-4 text-center">
                <p className="text-green-400 text-sm font-semibold">
                  Thanks for subscribing! Check your email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full border border-neutral-700 bg-neutral-900 py-3.5 pl-11 pr-5 text-sm text-white placeholder:text-neutral-500 focus:border-white focus:outline-none transition-colors duration-200"
                    style={{ borderRadius: 0 }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-white text-black text-xs font-black uppercase tracking-widest border-2 border-white hover:bg-transparent hover:text-white transition-all duration-300 focus:outline-none"
                  style={{ borderRadius: 0 }}
                >
                  Subscribe to Newsletter
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}