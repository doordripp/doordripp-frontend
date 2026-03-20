import React from "react"
import { CATEGORY_IMAGES } from '../../constants/categories'
import useScrollReveal from '../../hooks/useScrollReveal'

const categories = [
  {
    label: 'Men',
    href: '/category?gender=men',
    img: null, // resolved from CATEGORY_IMAGES
  },
]

export default function CategoriesSection() {
  const sectionRef = useScrollReveal({ stagger: 120 })

  return (
    <section className="w-full bg-white py-16 md:py-20" ref={sectionRef}>
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Section Title */}
        <div className="mb-12 reveal">
          <h2 className="text-3xl font-black uppercase tracking-tight text-black md:text-4xl">
            Browse by Categories
          </h2>
          <div className="mt-3 w-12 h-0.5 bg-black" />
        </div>

        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Men Card */}
          <div
            className="group relative h-[420px] w-full overflow-hidden bg-neutral-100 reveal"
            style={{ borderRadius: 0 }}
          >
            <a href="/category?gender=men" className="absolute inset-0 block" aria-label="Browse Men">
              <img
                src={CATEGORY_IMAGES.men}
                alt="Men"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-400" />
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-3xl font-black uppercase tracking-tight text-white">Men</span>
                <div className="mt-2 w-0 h-0.5 bg-white group-hover:w-12 transition-all duration-400" />
              </div>
            </a>
          </div>

          {/* Women Card */}
          <div
            className="group relative h-[420px] w-full overflow-hidden bg-neutral-100 reveal"
            style={{ borderRadius: 0 }}
          >
            <a href="/category?gender=women" className="absolute inset-0 block" aria-label="Browse Women">
              <img
                src={CATEGORY_IMAGES.women}
                alt="Women"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-400" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-3xl font-black uppercase tracking-tight text-white">Women</span>
                <div className="mt-2 w-0 h-0.5 bg-white group-hover:w-12 transition-all duration-400" />
              </div>
            </a>
          </div>

          {/* Diagonal Split — Accessories / Footwear */}
          <div
            className="relative h-[420px] w-full overflow-hidden bg-neutral-100 reveal"
            style={{ borderRadius: 0 }}
          >
            {/* Accessories — top-left triangle */}
            <a
              href="/category?category=accessories"
              className="group absolute inset-0 block transition-all duration-300 hover:z-10"
              style={{ clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)' }}
              aria-label="Browse Accessories"
            >
              <img
                src={CATEGORY_IMAGES.accessories}
                alt="Accessories"
                loading="lazy"
                className="h-full w-full object-cover object-center scale-[1.05] -translate-y-1 transition-transform duration-500 group-hover:scale-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute left-5 top-5">
                <span className="text-xl font-black uppercase tracking-tight text-black drop-shadow-sm group-hover:text-white transition-colors duration-200">Accessories</span>
                <div className="mt-1 w-0 h-0.5 bg-white group-hover:w-10 transition-all duration-300" />
              </div>
            </a>

            {/* Footwear — bottom-right triangle */}
            <a
              href="/category?category=footwear"
              className="group absolute inset-0 block transition-all duration-300 hover:z-10"
              style={{ clipPath: 'polygon(100% 6%, 100% 100%, 2% 100%)' }}
              aria-label="Browse Footwear"
            >
              <img
                src={CATEGORY_IMAGES.footwear}
                alt="Footwear"
                loading="lazy"
                className="h-full w-full object-cover object-bottom scale-[1.1] translate-x-9 translate-y-4 transition-transform duration-500 group-hover:scale-[1.15]"
              />
              <div className="absolute inset-0 bg-gradient-to-tl from-black/20 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 right-10">
                <span className="text-xl font-black uppercase tracking-tight text-black drop-shadow-sm group-hover:text-white transition-colors duration-200">Footwear</span>
              </div>
            </a>

            {/* Diagonal divider line */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 h-[570px] w-[2px] bg-white shadow-md"
              style={{ transform: 'rotate(45deg)', transformOrigin: '0 0' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
