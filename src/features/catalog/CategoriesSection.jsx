import React from "react";
import CategoryCard from './CategoryCard'
import { CATEGORY_IMAGES } from '../../constants/categories'
import { useNavigate } from 'react-router-dom'

export default function CategoriesSection() {
  const navigate = useNavigate();

  const handleTrialClick = () => {
    navigate('/trial-room');
  };

  return (
    <section className="w-full bg-gray-200 py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="mb-8 text-center text-3xl font-black tracking-wide uppercase text-black md:mb-12 md:text-4xl">
          Browse by Categories
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Men Card */}
          <div className="group relative h-[400px] w-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <a href="/category?gender=men" className="absolute inset-0 block" aria-label="Browse Men">
              <img
                src={CATEGORY_IMAGES.men}
                alt="Men"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-90"
              />
              {/* Hover/touch overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/15 to-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100 active:opacity-100 focus-visible:opacity-100" />
              <span className="pointer-events-none absolute left-4 top-4 text-2xl font-black tracking-wide text-black transition-all duration-300 group-hover:text-white active:text-white focus-visible:text-white group-hover:scale-[1.03]">
                Men
              </span>
            </a>
          </div>

          {/* Women Card */}
          <div className="group relative h-[400px] w-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <a href="/category?gender=women" className="absolute inset-0 block" aria-label="Browse Women">
              <img
                src={CATEGORY_IMAGES.women}
                alt="Women"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-90"
              />
              {/* Hover/touch overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/15 to-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100 active:opacity-100 focus-visible:opacity-100" />
              <span className="pointer-events-none absolute left-3 top-3 text-2xl font-black tracking-wide text-black transition-all duration-300 group-hover:text-white active:text-white focus-visible:text-white group-hover:scale-[1.03]">
                Women
              </span>
            </a>
          </div>

          {/* Diagonal Split Card - Accessories/Footwear */}
          <div className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-300 transition-all duration-300 hover:shadow-xl">
            {/* Accessories section - top-left triangle */}
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
                className="h-full w-full object-cover object-center scale-[1.05] -translate-y-1 transition-transform duration-500 group-hover:scale-110 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/15 to-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100 active:opacity-100 focus-visible:opacity-100" />
              <span className="pointer-events-none absolute left-4 top-4 text-2xl font-black tracking-wide text-black drop-shadow-lg transition-all duration-300 group-hover:text-white active:text-white focus-visible:text-white group-hover:scale-105">
                Accessories
              </span>
            </a>

            {/* Footwear section - bottom-right triangle */}
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
                className="h-full w-full object-cover object-bottom scale-[1.1] translate-x-9 translate-y-4 transition-transform duration-500 group-hover:scale-[1.15] group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-tl from-black/10 via-black/15 to-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100 active:opacity-100 focus-visible:opacity-100" />
              <span className="pointer-events-none absolute bottom-2 right-11 text-2xl font-black tracking-wide text-black drop-shadow-lg transition-all duration-300 group-hover:text-white active:text-white focus-visible:text-white group-hover:scale-105">
                Footwear
              </span>
            </a>

            {/* Clean diagonal line separator */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 h-[570px] w-[2px] bg-white/80 shadow-md"
              style={{
                transform: 'rotate(45deg)',
                transformOrigin: '0 0'
              }}
            />
          </div>

          {/* Trial Room Card */}
          <div 
            className="group relative h-[400px] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            onClick={handleTrialClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleTrialClick()}
            aria-label="Try products at home"
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/15 to-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-6 text-white text-center z-10">
              <div className="text-6xl mb-4 transition-transform duration-300 group-hover:scale-110">🏠</div>
              <h3 className="text-3xl font-black tracking-wide uppercase mb-3 drop-shadow-lg">Trial Room</h3>
              <p className="text-base mb-4 opacity-95 max-w-[250px] leading-relaxed">Try up to 3 items at home. Free delivery & pickup!</p>
              <span className="inline-block px-6 py-2.5 bg-white text-gray-800 font-bold rounded-lg transition-all duration-300 group-hover:bg-gray-50 group-hover:shadow-lg group-hover:-translate-y-0.5 text-sm uppercase tracking-wider">
                Start Trial →
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
