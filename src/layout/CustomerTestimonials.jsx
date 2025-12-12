import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star, CheckCircle } from 'lucide-react'

// Customer testimonials data
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah M.',
    verified: true,
    rating: 5,
    text: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations."
  },
  {
    id: 2,
    name: 'Alex K.',
    verified: true,
    rating: 5,
    text: "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions."
  },
  {
    id: 3,
    name: 'James L.',
    verified: true,
    rating: 5,
    text: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends."
  },
  {
    id: 4,
    name: 'Maria C.',
    verified: true,
    rating: 5,
    text: "The customer service at Shop.co is exceptional. They helped me find the perfect outfit for my wedding, and I couldn't be happier with their attention to detail and quality."
  }
]

function StarRating({ rating, size = 'sm' }) {
  const starSize = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'
  
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${starSize} ${
            i < rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
      {/* Rating */}
      <div className="mb-4">
        <StarRating rating={testimonial.rating} />
      </div>
      
      {/* Name and Verification */}
      <div className="flex items-center gap-2 mb-4">
        <h4 className="text-xl font-bold text-black">{testimonial.name}</h4>
        {testimonial.verified && (
          <CheckCircle className="h-5 w-5 text-green-500 fill-current" />
        )}
      </div>
      
      {/* Testimonial Text */}
      <p className="text-gray-600 leading-relaxed text-base">
        "{testimonial.text}"
      </p>
    </div>
  )
}

export default function CustomerTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 3
  const maxIndex = Math.max(0, TESTIMONIALS.length - itemsPerView)

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1))
  }

  const visibleTestimonials = TESTIMONIALS.slice(currentIndex, currentIndex + itemsPerView)

  return (
    <section className="w-full bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-black md:text-5xl lg:text-6xl">
            OUR HAPPY CUSTOMERS
          </h2>
          
          {/* Navigation Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {visibleTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-8">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {currentIndex + 1} / {Math.ceil(TESTIMONIALS.length / itemsPerView)}
          </span>
          <button
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Next testimonials"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}