import { Link } from 'react-router-dom'
import heroImg from '../assets/Rectangle 2 (2).png' 

function Star({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path fill="currentColor" d="M12 2c.5 3.6 2.4 5.5 6 6-3.6.5-5.5 2.4-6 6-.5-3.6-2.4-5.5-6-6 3.6-.5 5.5-2.4 6-6Z" />
    </svg>
  )
}

export default function Hero() {
  return (
    <section className="w-full bg-neutral-100 overflow-hidden">
      <div className="relative grid w-full max-w-[100vw] grid-cols-1 items-center gap-8 md:grid-cols-2 mx-auto">
        {/* Left copy */}
        <div className="px-6 py-19 md:px-12 md:py-16 lg:py-20">
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            FIND CLOTHES
            <br />
            THAT MATCHES YOUR
            <br />
            STYLE
          </h1>
          <p className="mt-6 max-w-xl text-base text-neutral-700 md:text-lg">
            Never suffer a wardrobe emergency again. Get your complete look delivered to your
            door in mere minutes. exactly when you need it. Your door is our deadline.
          </p>
          <div className="mt-8">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-neutral-900 transition-colors duration-200"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Right image */}
          <div className="relative flex w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-0 md:py-0 overflow-hidden">
            <div className="relative w-full max-w-[600px] md:max-w-[700px] lg:max-w-[800px] pb-0 md:pb-6">
              <img
                src={heroImg}
                alt="Couple wearing premium black streetwear"
                className="block h-auto w-full object-cover object-center select-none pointer-events-none"
                style={{
                  maxHeight: '600px',
                  minHeight: '400px'
                }}
                loading="eager"
                draggable="false"
              />
              {/* Background accent */}
              <div className="absolute -inset-5 -z-10 rounded-3xl bg-gradient-to-br from-black/5 to-gray-300/15 blur-xl"></div>
            </div>

            {/* Decorative elements */}
            <div className="absolute right-6 top-12 text-gray-400/40 pointer-events-none">
              <Star className="h-5 w-5" />
            </div>
            <div className="absolute left-6 bottom-16 text-gray-400/40 pointer-events-none">
              <Star className="h-7 w-7" />
            </div>
          </div>
      </div>
    </section>
  )
}
