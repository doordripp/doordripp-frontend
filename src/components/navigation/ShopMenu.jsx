import { useEffect, useRef, useState, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const ShopMenu = forwardRef(({ isOpen, onOpenChange, onClose, onMouseEnter, onMouseLeave }, ref) => {
  const [open, setOpen] = useState(false)
  const internalRef = useRef(null)
  const containerRef = ref || internalRef
  const navigate = useNavigate()
  const firstItemRef = useRef(null)

  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen)
    }
  }, [isOpen])

  const handleOpenChange = (newState) => {
    setOpen(newState)
    onOpenChange?.(newState)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        handleOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Handle navigation and close menu
  const handleNavigation = (path) => {
    handleOpenChange(false)
    onClose?.()
    // Scroll to top before navigation
    window.scrollTo(0, 0)
    navigate(path)
    // Scroll again after navigation to ensure it works
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 0)
  }

  const scrollToSection = (sectionId) => {
    handleOpenChange(false)
    onClose?.()
    // Scroll to top first
    window.scrollTo(0, 0)
    if (window.location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Keyboard navigation support
  const onKeyDown = (e) => {
    if (!open) return
    const items = Array.from(containerRef.current.querySelectorAll('[role="menuitem"]'))
    const index = items.indexOf(document.activeElement)
    if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(index + 1) % items.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(index - 1 + items.length) % items.length]?.focus()
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-black/80 transition-colors duration-200 font-medium"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Shop <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-md border border-gray-200 bg-white shadow-lg transition-all duration-200 ${
          open ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}
        role="menu"
        aria-label="Shop menu"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="py-1">
          <button
            onClick={() => handleNavigation('/products')}
            className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100"
            role="menuitem"
          >
            All Products
          </button>
          <button
            onClick={() => scrollToSection('new-arrivals')}
            className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100"
            role="menuitem"
          >
            New Arrivals
          </button>
          <button
            onClick={() => scrollToSection('top-selling')}
            className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100"
            role="menuitem"
          >
            Best Sellers
          </button>
          <div className="my-1 border-t border-gray-200"></div>
          <button
            onClick={() => handleNavigation('/category?category=casual')}
            className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100"
            role="menuitem"
          >
            All Categories
          </button>
          <button
            onClick={() => handleNavigation('/category?category=casual&subcategory=T-shirts')}
            className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100"
            role="menuitem"
          >
            T-Shirts
          </button>
          <button
            onClick={() => handleNavigation('/category?category=casual&subcategory=Shirts')}
            className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100"
            role="menuitem"
          >
            Shirts
          </button>
          <button
            onClick={() => handleNavigation('/category?category=casual&subcategory=Jeans')}
            className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100"
            role="menuitem"
          >
            Jeans
          </button>
          <button
            onClick={() => handleNavigation('/category?category=casual&subcategory=Shorts')}
            className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100"
            role="menuitem"
          >
            Shorts
          </button>
        </div>
      </div>
    </div>
  )
})

ShopMenu.displayName = 'ShopMenu'

export default ShopMenu
