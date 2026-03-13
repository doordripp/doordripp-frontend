import React from 'react'
import { Link } from 'react-router-dom'

// items: [{ label: 'Home', to: '/' }, { label: 'Category', to: '/category/...'}, { label: 'Product', to: null }]
export default function Breadcrumb({ items = [], className = '' }) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="inline-flex items-center gap-3 text-sm text-gray-600 bg-white/50 rounded-md px-3 py-2">
        {items.map((it, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} className="flex items-center">
              {!isLast && it.to ? (
                <Link to={it.to} className="hover:text-gray-900 truncate">
                  {it.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={`${isLast ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{it.label}</span>
              )}
              {!isLast && <span className="text-gray-300 ml-3">›</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Helper: build breadcrumb for product pages
export function buildProductBreadcrumb({ product }) {
  const items = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/products' }
  ]

  if (product?.category) {
    items.push({ label: product.category, to: `/category?category=${encodeURIComponent(product.category)}` })
  }
  if (product?.subcategory) {
    items.push({ label: product.subcategory, to: `/category?subcategory=${encodeURIComponent(product.subcategory)}` })
  }

  // product short title (limit to 3 words)
  const short = (product?.name || '').split('||')[0].split(' ').slice(0, 3).join(' ')
  items.push({ label: short, to: null })

  return items
}
