import { Link } from 'react-router-dom'
import { ACCESSORIES_PRODUCTS, FOOTWEAR_PRODUCTS } from '../../constants/products'
import ProductCard from './ProductCard'

export default function PopularProducts() {
  // Combine accessories and footwear products to show 6 products
  const displayProducts = [...ACCESSORIES_PRODUCTS, ...FOOTWEAR_PRODUCTS].slice(0, 6)

  return (
    <section id="popular-products" className="w-full bg-gray-100 py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Section Header - Centered with View All */}
        <div className="mb-14 text-center relative">
          <h2 className="text-4xl font-bold text-black md:text-5xl lg:text-6xl tracking-tight">
            POPULAR PRODUCTS
          </h2>
          <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2">
            <Link 
              to="/products" 
              className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 bg-white px-10 py-3.5 text-base font-semibold text-black shadow-md transition-all duration-300 hover:bg-black hover:text-white hover:border-black hover:shadow-xl hover:scale-105 active:scale-95"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Products Grid - 6 Products */}
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 max-w-[1200px] mx-auto">
          {displayProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              className="mx-auto w-full"
            />
          ))}
        </div>

        {/* View All Button for Mobile */}
        <div className="mt-14 text-center md:hidden">
          <Link 
            to="/products" 
            className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 bg-white px-10 py-3.5 text-base font-semibold text-black shadow-md transition-all duration-300 hover:bg-black hover:text-white hover:border-black active:scale-95"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  )
}
