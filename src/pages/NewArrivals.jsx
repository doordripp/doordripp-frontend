import { useEffect, useState } from 'react'
import { apiGet } from '../services/apiClient'
import { ProductCard } from '../features/catalog'
import { NEW_ARRIVALS } from '../constants/products'

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ page: 1, limit: 24, total: 0 })

  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    // Fetch from API for products marked as New Arrivals
    apiGet('/products?page=1&limit=100')
      .then(res => {
        if (!mounted) return
        const apiProducts = res.data || []
        // Filter products where isNewArrival is true
        const newArrivals = apiProducts.filter(p => p.isNewArrival === true)
        
        // Sort by creation date (newest first)
        newArrivals.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0)
          const dateB = new Date(b.createdAt || 0)
          return dateB - dateA // Newest first
        })
        
        // Combine: API products first (newest), then static products
        const combinedProducts = [...newArrivals, ...NEW_ARRIVALS]
        
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
        setMeta({ page: 1, limit: uniqueProducts.length, total: uniqueProducts.length })
      })
      .catch(err => {
        console.error(err)
        // Fallback to static products on error
        if (mounted) {
          setProducts(NEW_ARRIVALS)
          setMeta({ page: 1, limit: NEW_ARRIVALS.length, total: NEW_ARRIVALS.length })
        }
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-black">New Arrivals</h1>
          <p className="mt-4 text-lg text-gray-600">Recently added items</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <p>No new arrivals found.</p>
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
