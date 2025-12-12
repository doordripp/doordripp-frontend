import { useEffect, useState } from 'react'
import { apiGet } from '../services/apiClient'
import { ProductCard } from '../features/catalog'

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ page: 1, limit: 24, total: 0 })

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiGet('/products?type=new&page=1&limit=24')
      .then(res => {
        if (!mounted) return
        setProducts(res.data || [])
        setMeta(res.meta || { page: 1, limit: 24, total: 0 })
      })
      .catch(err => console.error(err))
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
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
