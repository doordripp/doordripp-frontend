import { useEffect, useState } from 'react'
import { apiGet } from '../services/apiClient'
import { ProductCard } from '../features/catalog'

export default function BestSellersPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    apiGet('/products?type=best&page=1&limit=24')
      .then(res => {
        if (!mounted) return
        setProducts(res.data || [])
      })
      .catch(err => console.error(err))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-black">Best Sellers</h1>
          <p className="mt-4 text-lg text-gray-600">Top selling items</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <p>No best sellers found.</p>
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
