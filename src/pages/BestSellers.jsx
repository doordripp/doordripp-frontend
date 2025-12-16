import { useEffect, useState } from 'react'
import { apiGet } from '../services/apiClient'
import { ProductCard } from '../features/catalog'
import { TOP_SELLING } from '../constants/products'

export default function BestSellersPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    // Fetch from API for products marked as Top Selling
    apiGet('/products?page=1&limit=100')
      .then(res => {
        if (!mounted) return
        const apiProducts = res.data || []
        // Filter products where isBestSeller is true (Top Selling)
        const bestSellers = apiProducts.filter(p => p.isBestSeller === true)
        
        // Combine with static TOP_SELLING products
        const combinedProducts = [...TOP_SELLING, ...bestSellers]
        
        // Remove duplicates based on slug or _id
        const uniqueProducts = combinedProducts.reduce((acc, product) => {
          const exists = acc.find(p => 
            (p.slug && product.slug && p.slug === product.slug) || 
            (p._id && product._id && p._id.toString() === product._id.toString())
          )
          if (!exists) acc.push(product)
          return acc
        }, [])
        
        setProducts(uniqueProducts)
      })
      .catch(err => {
        console.error(err)
        // Fallback to static products on error
        if (mounted) {
          setProducts(TOP_SELLING)
        }
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-black">Top Selling</h1>
          <p className="mt-4 text-lg text-gray-600">Our most popular items</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <p>No top selling products found.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(p => (
              <ProductCard key={p._id || p.slug} product={p} initialImageIndex={1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
