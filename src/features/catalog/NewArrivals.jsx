import { Link } from 'react-router-dom'
import { NEW_ARRIVALS } from '../../constants/products'
import ProductCard from './ProductCard'

export default function NewArrivals() {
  return (
    <section id="new-arrivals" className="w-full bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-black md:text-5xl lg:text-6xl">
            NEW ARRIVALS
          </h2>
        </div>

        {/* Products Grid */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {NEW_ARRIVALS.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              className="mx-auto w-full max-w-[295px]"
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link 
            to="/products" 
            className="inline-flex items-center justify-center rounded-full border-2 border-gray-200 bg-white px-8 py-3 text-base font-medium text-black transition-all duration-300 hover:bg-black hover:text-white hover:border-black"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  )
}