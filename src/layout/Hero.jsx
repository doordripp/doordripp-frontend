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
    <section className="w-full bg-gradient-to-br from-neutral-50 via-white to-neutral-100 overflow-hidden min-h-[600px] md:min-h-[650px] lg:min-h-[700px]">
      <div className="relative grid w-full max-w-[100vw] grid-cols-1 items-center gap-8 md:grid-cols-2 mx-auto h-full">
        {/* Left copy */}
        <div className="px-6 py-16 md:px-12 md:py-20 lg:py-24">
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
        <div className="relative flex w-full items-center justify-center py-12 md:py-16 lg:py-20 overflow-visible">
          <div className="relative w-full max-w-[450px] md:max-w-[500px] lg:max-w-[550px] group">
            {/* Card container with animation */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 bg-white p-3">
              {/* Image wrapper */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                <img
                  src={heroImg}
                  alt="Couple wearing premium streetwear"
                  className="block h-auto w-full object-cover object-top select-none pointer-events-none transition-transform duration-700 group-hover:scale-105"
                  style={{
                    maxHeight: '600px',
                    minHeight: '400px',
                    aspectRatio: '3/4'
                  }}
                  loading="eager"
                  draggable="false"
                />
                
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>

            {/* Card shadow/border effects */}
            <div className="absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-br from-neutral-200/50 to-neutral-300/30 blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Subtle accent line */}
            <div className="absolute -top-3 -left-3 w-20 h-20 border-t-4 border-l-4 border-black/10 rounded-tl-3xl transition-all duration-500 group-hover:w-24 group-hover:h-24 group-hover:border-black/20"></div>
            <div className="absolute -bottom-3 -right-3 w-20 h-20 border-b-4 border-r-4 border-black/10 rounded-br-3xl transition-all duration-500 group-hover:w-24 group-hover:h-24 group-hover:border-black/20"></div>

            {/* Decorative elements */}
            <div className="absolute right-6 top-12 text-gray-400/40 pointer-events-none animate-pulse">
              <Star className="h-5 w-5" />
            </div>
            <div className="absolute left-6 bottom-16 text-gray-400/40 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}>
              <Star className="h-7 w-7" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
