import { useState } from 'react'
import { Menu, X, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      title: 'Categories',
      links: [
        { name: 'All Categories', href: '/category?category=casual' },
        { name: 'Men', href: '/category?gender=men' },
        { name: 'Women', href: '/category?gender=women' },
        { name: 'Accessories', href: '/category?category=accessories' },
        { name: 'Footwear', href: '/category?category=footwear' }
      ]
    },
    {
      title: 'Quick Links',
      links: [
        { name: 'All Products', href: '/products' },
        { name: 'New Arrivals', href: '/#new-arrivals' },
        { name: 'Best Sellers', href: '/#top-selling' },
        { name: 'About', href: '/about' },
        { name: 'Under ₹100', href: '/category?category=casual&priceRange=50-100' }
      ]
    }
  ]

  const { user, logout } = useAuth()

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed right-0 top-0 h-full w-80 max-w-sm bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Menu Content */}
            <div className="overflow-y-auto p-4 space-y-6">
              {menuItems.map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.links.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <span className="text-gray-900 group-hover:text-black">
                          {link.name}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Additional Actions */}
              <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    {user ? (
                      <>
                        <button
                          onClick={() => { logout(); setIsOpen(false) }}
                          className="block w-full text-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Logout
                        </button>
                        <Link
                          to="/profile"
                          onClick={() => setIsOpen(false)}
                          className="block w-full text-center py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Profile
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setIsOpen(false)}
                          className="block w-full text-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setIsOpen(false)}
                          className="block w-full text-center py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}