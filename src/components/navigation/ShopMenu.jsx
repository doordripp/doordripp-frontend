import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ShopMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Lock body scroll when menu is open
  useEffect(() => {
    const prev = document.body.style.overflow
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = prev || ''
    return () => {
      document.body.style.overflow = prev || ''
    }
  }, [open])

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-black/70"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Shop <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Screen overlay to block background interaction */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-neutral-200 bg-white shadow-lg transition-all ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
        }`}
        role="menu"
      >
        <div className="py-2">
          {/* Featured Categories */}
          <div className="px-3 py-2 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categories</h3>
            <div className="space-y-1">
              <Link
                to="/category?category=casual"
                className="block px-2 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                All Categories
              </Link>
              <Link
                to="/category?category=casual&subcategory=T-shirts"
                className="block px-2 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                T-Shirts
              </Link>
              <Link
                to="/category?category=casual&subcategory=Shirts"
                className="block px-2 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                Shirts
              </Link>
              <Link
                to="/category?category=casual&subcategory=Jeans"
                className="block px-2 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                Jeans
              </Link>
              <Link
                to="/category?category=casual&subcategory=Shorts"
                className="block px-2 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                Shorts
              </Link>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Links</h3>
            <div className="space-y-1">
              <Link
                to="/products"
                className="block px-2 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                All Products
              </Link>
              <Link
                to="/#new-arrivals"
                className="block px-2 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                New Arrivals
              </Link>
              <Link
                to="/#top-selling"
                className="block px-2 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                Best Sellers
              </Link>
              <Link
                to="/category?category=casual&priceRange=50-100"
                className="block px-2 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                Under $100
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
