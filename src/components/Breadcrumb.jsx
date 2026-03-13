import { Link, useLocation } from 'react-router-dom'

export default function Breadcrumb({ category, subcategory }) {
  const location = useLocation()

  const isProductPage = location.pathname.startsWith('/product/')

  return (
    <nav
      className="mb-6 text-sm text-gray-600"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center flex-wrap gap-2">

        {/* Home */}
        <li>
          <Link to="/" className="hover:text-black">
            Home
          </Link>
        </li>

        {/* Category */}
        {category && (
          <>
            <li>›</li>
            <li>
              <Link
                to={`/category?category=${category}`}
                className="hover:text-black capitalize"
              >
                {category}
              </Link>
            </li>
          </>
        )}

        {/* Subcategory */}
        {subcategory && (
          <>
            <li>›</li>
            <li>
              <Link
                to={`/category?category=${category}&subcategory=${subcategory}`}
                className="hover:text-black capitalize"
              >
                {subcategory}
              </Link>
            </li>
          </>
        )}

        {/* Product (TEXT ONLY) */}
        {isProductPage && (
          <>
            <li>›</li>
            <li className="font-medium text-gray-900">
              Product
            </li>
          </>
        )}

      </ol>
    </nav>
  )
}
