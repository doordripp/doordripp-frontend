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
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 3000)
    }
  }

  return (
    <section className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-black py-10 lg:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Content */}
          <div className="lg:max-w-md">
            <h3 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl leading-tight">
              STAY UPTO DATE ABOUT OUR LATEST OFFERS
            </h3>
          </div>

          {/* Right Content - Email Form */}
          <div className="lg:max-w-md w-full">
            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-full px-6 py-4 text-center">
                <p className="text-green-700 font-medium">
                  Thanks for subscribing! Check your email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full rounded-full border-0 bg-white py-4 pl-12 pr-6 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-white py-4 px-6 text-base font-semibold text-black transition-all duration-300 hover:bg-gray-100 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/20"
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