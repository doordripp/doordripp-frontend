import { useState, useRef, useEffect } from 'react'
import { ShoppingCart, User, X, ChevronDown, MessageSquare } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Searchbar from './Searchbar'
import ShopMenu from './ShopMenu'
import MobileMenu from './MobileMenu'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import Logo from '../ui/Logo'

export default function Navbar() {
	const [showBanner, setShowBanner] = useState(true)
	const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false)
	const [showShopDropdown, setShowShopDropdown] = useState(false)
	const [scrolled, setScrolled] = useState(false)
	const categoriesRef = useRef(null)
	const shopRef = useRef(null)
	const closeTimeoutRef = useRef(null)
	const navigate = useNavigate()
	const { cartTotals, toggleDrawer } = useCart()
	const { user } = useAuth()

	// Track scroll for glass effect
	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20)
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [])

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
		if (closeTimeoutRef.current) { clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null }
		setShowShopDropdown(true)
		setShowCategoriesDropdown(false)
	}
	const handleShopMouseLeave = () => {
		if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
		closeTimeoutRef.current = setTimeout(() => setShowShopDropdown(false), 150)
	}
	const handleCategoriesMouseEnter = () => {
		if (closeTimeoutRef.current) { clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null }
		setShowCategoriesDropdown(true)
		setShowShopDropdown(false)
	}
	const handleCategoriesMouseLeave = () => {
		if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
		closeTimeoutRef.current = setTimeout(() => setShowCategoriesDropdown(false), 150)
	}
	const closeAllDropdowns = () => {
		if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
		setShowShopDropdown(false)
		setShowCategoriesDropdown(false)
	}

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (categoriesRef.current && !categoriesRef.current.contains(event.target)) setShowCategoriesDropdown(false)
			if (shopRef.current && !shopRef.current.contains(event.target)) setShowShopDropdown(false)
		}
		if (showCategoriesDropdown || showShopDropdown) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
		}
	}, [showCategoriesDropdown, showShopDropdown])

	return (
		<header
			className={`w-full z-50 sticky top-0 transition-all duration-300 ${
				scrolled
					? 'bg-white/90 backdrop-blur-md border-b border-neutral-200/80 shadow-sm'
					: 'bg-white border-b border-neutral-200'
			}`}
		>
			{/* Promo Banner with Marquee */}
			{showBanner && !user && (
				<div className="w-full bg-black text-white text-xs overflow-hidden relative">
					<div className="flex items-center justify-center gap-2 px-3 py-2 relative w-full">
						{/* Marquee text */}
						<div className="overflow-hidden flex-1 max-w-xl mx-auto">
							<div className="marquee-track whitespace-nowrap text-[10px] sm:text-xs">
								<span className="inline-block px-4 sm:px-8">Sign up and get 20% off your first order.&nbsp;<span className="underline underline-offset-2 cursor-pointer" onClick={() => navigate('/signup')}>Sign Up Now →</span></span>
								<span className="inline-block px-4 sm:px-8">Free delivery on orders above ₹999.&nbsp;</span>
								<span className="inline-block px-4 sm:px-8">Sign up and get 20% off your first order.&nbsp;<span className="underline underline-offset-2 cursor-pointer" onClick={() => navigate('/signup')}>Sign Up Now →</span></span>
								<span className="inline-block px-4 sm:px-8">Free delivery on orders above ₹999.&nbsp;</span>
							</div>
						</div>
						<button
							aria-label="Close banner"
							className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
							onClick={() => setShowBanner(false)}
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
			)}

			<div className="flex w-full items-center gap-4 px-3 py-3">
				{/* Brand */}
				<a href="/" className="shrink-0 flex items-center gap-3 group" onMouseEnter={closeAllDropdowns}>
					<Logo size={32} className="group-hover:scale-105 transition-transform duration-200" />
					<span className="text-xl font-black tracking-[0.12em] uppercase">DOORDRIPP</span>
				</a>

				{/* Nav links */}
				<nav className="hidden md:flex items-center ml-6">
					{/* Primary nav items with refined styling */}
					<div className="flex items-center">
						<span className="nav-link-item">
							<ShopMenu
								ref={shopRef}
								isOpen={showShopDropdown}
								onOpenChange={setShowShopDropdown}
								onClose={() => { setShowShopDropdown(false); setShowCategoriesDropdown(false) }}
								onMouseEnter={handleShopMouseEnter}
								onMouseLeave={handleShopMouseLeave}
							/>
						</span>

						<span className="mx-3 text-neutral-300 text-[8px] select-none" aria-hidden>●</span>

						{/* Categories Dropdown */}
						<div
							ref={categoriesRef}
							className="relative"
							onMouseEnter={handleCategoriesMouseEnter}
							onMouseLeave={handleCategoriesMouseLeave}
						>
							<Link to="/category" className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-800 hover:text-black transition-colors duration-150 link-underline">
								Categories
								<ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showCategoriesDropdown ? 'rotate-180' : ''}`} />
							</Link>

							<div
								className={`absolute left-0 top-full z-50 mt-2 min-w-[200px] border border-gray-200 bg-white shadow-2xl transition-all duration-200 ${
									showCategoriesDropdown ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none'
								}`}
								onMouseEnter={handleCategoriesMouseEnter}
								onMouseLeave={handleCategoriesMouseLeave}
							>
								<div className="py-1">
									{[
										{ label: 'All Categories', href: '/category?category=casual' },
										{ label: 'Men',           href: '/category?gender=men' },
										{ label: 'Women',         href: '/category?gender=women' },
										{ label: 'Accessories',   href: '/category?category=accessories' },
										{ label: 'Footwear',      href: '/category?category=footwear' },
									].map((item) => (
										<Link
											key={item.href}
											to={item.href}
											onClick={() => setShowCategoriesDropdown(false)}
											className="block px-5 py-2.5 text-[11px] font-semibold tracking-wider text-gray-700 hover:bg-black hover:text-white transition-colors duration-100 uppercase"
										>
											{item.label}
										</Link>
									))}
								</div>
							</div>
						</div>

						<span className="mx-3 text-neutral-300 text-[8px] select-none" aria-hidden>●</span>

						<Link to="/new-arrivals" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-800 hover:text-black transition-colors duration-150 link-underline" onMouseEnter={closeAllDropdowns}>New Arrivals</Link>

						<span className="mx-3 text-neutral-300 text-[8px] select-none" aria-hidden>●</span>

						<Link to="/best-sellers" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-800 hover:text-black transition-colors duration-150 link-underline" onMouseEnter={closeAllDropdowns}>Best Sellers</Link>

						<span className="mx-3 text-neutral-300 text-[8px] select-none" aria-hidden>●</span>

						<Link to="/trial-room" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-800 hover:text-black transition-colors duration-150 link-underline" onMouseEnter={closeAllDropdowns}>Trial Room</Link>

						<span className="mx-3 text-neutral-300 text-[8px] select-none" aria-hidden>●</span>

						<Link to="/support" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-800 hover:text-black transition-colors duration-150 link-underline" onMouseEnter={closeAllDropdowns}>Support</Link>
					</div>
				</nav>

				{/* Spacer + Search */}
				<div className="flex-1" onMouseEnter={closeAllDropdowns} />
				<Searchbar className="hidden sm:flex w-[360px] max-w-full" onSearch={handleSearch} onMouseEnter={closeAllDropdowns} />

				{/* Icons */}
				<div className="ml-2 flex items-center gap-3" onMouseEnter={closeAllDropdowns}>
					<MobileMenu />

					{/* Cart */}
					<div className="relative">
						<button onClick={handleCartClick} aria-label="Open cart" className="p-1 hover:opacity-60 transition-opacity group relative">
							<ShoppingCart className="h-5 w-5 group-hover:scale-105 transition-transform duration-200" />
							{cartTotals.totalItems > 0 && (
								<span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center font-black">
									{cartTotals.totalItems > 99 ? '99+' : cartTotals.totalItems}
								</span>
							)}
						</button>
						<Link to="/cart" className="absolute inset-0 opacity-0 pointer-events-none" aria-label="View cart page" />
					</div>

					{/* User */}
					{user ? (
						<div className="flex items-center gap-3">
							<Link to="/profile" className="p-1 hover:opacity-60 transition-opacity group">
								{user.avatar && user.avatar.trim() !== '' ? (
									<img
										src={user.avatar}
										alt="avatar"
										className="h-7 w-7 object-cover"
										style={{ borderRadius: 0 }}
										onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
									/>
								) : null}
								<span
									style={{ display: user.avatar && user.avatar.trim() !== '' ? 'none' : 'flex', borderRadius: 0 }}
									className="h-7 w-7 bg-black text-white items-center justify-center text-xs font-black group-hover:scale-105 transition-transform"
								>
									{user.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
								</span>
							</Link>
						</div>
					) : (
						<Link to="/login" aria-label="Account" className="p-1 hover:opacity-60 transition-opacity group">
							<User className="h-5 w-5 group-hover:scale-105 transition-transform duration-200" />
						</Link>
					)}
				</div>
			</div>
		</header>
	)
}
