import { useEffect, useState } from 'react'
import { apiGet } from '../services/apiClient'
import { ProductCard } from '../features/catalog'

export default function BestSellersPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    // Fetch from API for products marked as Best Seller
    apiGet('/products?page=1&limit=100')
      .then(res => {
        if (!mounted) return
        const apiProducts = res.data || []
        // Filter products where isBestSeller is true
        const bestSellers = apiProducts.filter(p => p.isBestSeller === true)
        
        // Sort by creation date (newest first)
        bestSellers.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0)
          const dateB = new Date(b.createdAt || 0)
          return dateB - dateA
        })
        
        setProducts(bestSellers)
      })
      .catch(err => {
        console.error(err)
        if (mounted) {
          setProducts([])
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
