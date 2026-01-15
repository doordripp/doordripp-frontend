import { useState, useRef, useEffect } from 'react'
import { ShoppingCart, User, X, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Searchbar from './Searchbar'
import ShopMenu from './ShopMenu'
import MobileMenu from './MobileMenu'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
	const [showBanner, setShowBanner] = useState(true)
	const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false)
	const [showShopDropdown, setShowShopDropdown] = useState(false)
	const categoriesRef = useRef(null)
	const shopRef = useRef(null)
	const closeTimeoutRef = useRef(null)
	const navigate = useNavigate()
	const { cartTotals, toggleDrawer } = useCart()
	const { user, logout } = useAuth()

	const handleSearch = (searchQuery) => {
		if (searchQuery.trim()) {
			navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
		}
	}

	const scrollToSection = (sectionId) => {
		if (window.location.pathname !== '/') {
			navigate('/')
			setTimeout(() => {
				document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
			}, 100)
		} else {
			document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
		}
	}

	const handleCartClick = (e) => {
		e.preventDefault()
		toggleDrawer(true)
	}

	const handleShopMouseEnter = () => {
		if (closeTimeoutRef.current) {
			clearTimeout(closeTimeoutRef.current)
			closeTimeoutRef.current = null
		}
		setShowShopDropdown(true)
		setShowCategoriesDropdown(false)
	}

	const handleShopMouseLeave = () => {
		if (closeTimeoutRef.current) {
			clearTimeout(closeTimeoutRef.current)
		}
		closeTimeoutRef.current = setTimeout(() => {
			setShowShopDropdown(false)
		}, 150)
	}

	const handleCategoriesMouseEnter = () => {
		if (closeTimeoutRef.current) {
			clearTimeout(closeTimeoutRef.current)
			closeTimeoutRef.current = null
		}
		setShowCategoriesDropdown(true)
		setShowShopDropdown(false)
	}

	const handleCategoriesMouseLeave = () => {
		if (closeTimeoutRef.current) {
			clearTimeout(closeTimeoutRef.current)
		}
		closeTimeoutRef.current = setTimeout(() => {
			setShowCategoriesDropdown(false)
		}, 150)
	}

	const closeAllDropdowns = () => {
		if (closeTimeoutRef.current) {
			clearTimeout(closeTimeoutRef.current)
		}
		setShowShopDropdown(false)
		setShowCategoriesDropdown(false)
	}

	// Close dropdowns on outside click
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
				setShowCategoriesDropdown(false)
			}
			if (shopRef.current && !shopRef.current.contains(event.target)) {
				setShowShopDropdown(false)
			}
		}

		if (showCategoriesDropdown || showShopDropdown) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			if (closeTimeoutRef.current) {
				clearTimeout(closeTimeoutRef.current)
			}
		}
	}, [showCategoriesDropdown, showShopDropdown])

	return (
		<header className="w-full border-b border-neutral-200/60 bg-white z-50 sticky top-0">
			{showBanner && (
				<div className="w-full bg-black text-white text-xs">
					<div className="flex items-center justify-center gap-2 px-3 py-2 relative w-full">
						<span>Sign up and get 20% off your first order.</span>
						<Link to="/signup" className="underline underline-offset-2 hover:text-neutral-200">Sign Up Now</Link>
						<button aria-label="Close banner" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-80" onClick={() => setShowBanner(false)}>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			<div className="flex w-full items-center gap-4 px-3 py-3">
				{/* Left: Brand */}
				<a href="/" className="shrink-0 text-xl font-extrabold tracking-wide" onMouseEnter={closeAllDropdowns}>DOORDRIPP</a>

				{/* Middle: Nav links */}
				<nav className="hidden md:flex items-center gap-6 text-sm">
					<ShopMenu 
						ref={shopRef}
						isOpen={showShopDropdown}
						onOpenChange={setShowShopDropdown}
						onClose={() => {
							setShowShopDropdown(false)
							setShowCategoriesDropdown(false)
						}}
						onMouseEnter={handleShopMouseEnter}
						onMouseLeave={handleShopMouseLeave}
					/>
					{/* Categories Dropdown */}
					<div 
						ref={categoriesRef} 
						className="relative" 
						onMouseEnter={handleCategoriesMouseEnter}
						onMouseLeave={handleCategoriesMouseLeave}
					>
						<button className="inline-flex items-center gap-1 hover:text-black/80 transition-colors duration-200 font-medium">
							Categories
							<ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCategoriesDropdown ? 'rotate-180' : ''}`} />
						</button>

						<div 
							className={`absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-md border border-gray-200 bg-white shadow-lg transition-all duration-200 ${showCategoriesDropdown ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none'}`}
							onMouseEnter={handleCategoriesMouseEnter}
							onMouseLeave={handleCategoriesMouseLeave}
						>
							<div className="py-1">
								<Link to="/category?category=casual" onClick={() => setShowCategoriesDropdown(false)} className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100">
									All Categories
								</Link>
								<Link to="/category?gender=men" onClick={() => setShowCategoriesDropdown(false)} className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100">
									Men
								</Link>
								<Link to="/category?gender=women" onClick={() => setShowCategoriesDropdown(false)} className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100">
									Women
								</Link>
								<Link to="/category?category=accessories" onClick={() => setShowCategoriesDropdown(false)} className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100">
									Accessories
								</Link>
								<Link to="/category?category=footwear" onClick={() => setShowCategoriesDropdown(false)} className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-100">
									Footwear
								</Link>
							</div>
						</div>
					</div>

					<Link to="/products" className="hover:text-black/70 transition-colors duration-200" onMouseEnter={closeAllDropdowns}>All Products</Link>
					<button onClick={() => scrollToSection('new-arrivals')} className="hover:text-black/70 transition-colors duration-200" onMouseEnter={closeAllDropdowns}>New Arrivals</button>
					<button onClick={() => scrollToSection('top-selling')} className="hover:text-black/70 transition-colors duration-200" onMouseEnter={closeAllDropdowns}>Best Sellers</button>
			</nav>

				{/* Search */}
				<div className="flex-1" onMouseEnter={closeAllDropdowns} />
				<Searchbar className="hidden sm:flex w-[400px] max-w-full" onSearch={handleSearch} onMouseEnter={closeAllDropdowns} />

				{/* Right: Icons */}
				<div className="ml-2 flex items-center gap-4" onMouseEnter={closeAllDropdowns}>
					{/* Mobile Menu */}
					<MobileMenu />

					{/* Cart Icon with Count */}
					<div className="relative">
						<button onClick={handleCartClick} aria-label="Open cart" className="p-1 hover:opacity-70 transition-opacity duration-200 relative group">
							<ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
							{cartTotals.totalItems > 0 && (
								<span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium animate-pulse">
									{cartTotals.totalItems > 99 ? '99+' : cartTotals.totalItems}
								</span>
							)}
						</button>
						<Link to="/cart" className="absolute inset-0 opacity-0 pointer-events-none" aria-label="View cart page" />
					</div>

					{user ? (
						<div className="flex items-center gap-3">
							<Link to="/profile" className="p-1 hover:opacity-70 transition-opacity duration-200 group">
								{user.avatar ? (
									<img src={user.avatar} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
								) : (
									<User className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
								)}
							</Link>
						</div>
					) : (
						<Link to="/login" aria-label="Account" className="p-1 hover:opacity-70 transition-opacity duration-200 group">
							<User className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
						</Link>
					)}
				</div>
			</div>
		</header>
	)
}
