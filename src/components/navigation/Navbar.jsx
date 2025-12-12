import { useState } from 'react'
import { ShoppingCart, User, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Searchbar from './Searchbar'
import ShopMenu from './ShopMenu'
import MobileMenu from './MobileMenu'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { hasAdminAccess } from '../../utils/roleUtils'

export default function Navbar() {
	const [showBanner, setShowBanner] = useState(true)
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
				const element = document.getElementById(sectionId)
				if (element) {
					element.scrollIntoView({ behavior: 'smooth' })
				}
			}, 100)
		} else {
			const element = document.getElementById(sectionId)
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' })
			}
		}
	}

	const handleCartClick = (e) => {
		e.preventDefault()
		toggleDrawer(true)
	}

	return (
		<header className="w-full border-b border-neutral-200/60 bg-white z-50  sticky top-0">
			{showBanner && (
				<div className="w-full bg-black text-white text-xs">
					<div className="flex items-center justify-center gap-2 px-3 py-2 relative w-full">
						<span>
							Sign up and get 20% off your first order.
						</span>
						<Link to="/signup" className="underline underline-offset-2 hover:text-neutral-200">
							Sign Up Now
						</Link>
						<button
							aria-label="Close banner"
							className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-80"
							onClick={() => setShowBanner(false)}
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			<div className="flex w-full items-center gap-4 px-3 py-3">
				{/* Left: Brand */}
				<a href="/" className="shrink-0 text-xl font-extrabold tracking-wide">
					DOORDRIPP
				</a>

        {/* Middle: Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <ShopMenu />
          <Link 
            to="/category?category=casual" 
            className="hover:text-black/70 transition-colors duration-200 font-medium"
          >
            Categories
          </Link>
          <Link to="/products" className="hover:text-black/70 transition-colors duration-200">All Products</Link>
          <button 
            onClick={() => scrollToSection('new-arrivals')} 
            className="hover:text-black/70 transition-colors duration-200"
          >
            New Arrivals
          </button>
          <button 
            onClick={() => scrollToSection('top-selling')} 
            className="hover:text-black/70 transition-colors duration-200"
          >
            Best Sellers
          </button>
        </nav>

				{/* Search */}
				<div className="flex-1" />
				<Searchbar 
					className="hidden sm:flex w-[400px] max-w-full" 
					onSearch={handleSearch}
				/>

				{/* Right: Icons */}
				<div className="ml-2 flex items-center gap-4">
					{/* Mobile Menu */}
					<MobileMenu />
					
					{/* Cart Icon with Count */}
					<div className="relative">
						<button 
							onClick={handleCartClick}
							aria-label="Open cart"
							className="p-1 hover:opacity-70 transition-opacity duration-200 relative group"
						>
							<ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
							{cartTotals.totalItems > 0 && (
								<span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium animate-pulse">
									{cartTotals.totalItems > 99 ? '99+' : cartTotals.totalItems}
								</span>
							)}
						</button>
						
						{/* Cart Link for fallback */}
						<Link 
							to="/cart" 
							className="absolute inset-0 opacity-0 pointer-events-none"
							aria-label="View cart page"
						/>
					</div>
					
										{user ? (
											<div className="flex items-center gap-3">
											{/* Admin link visible only to admins */}
											{hasAdminAccess(user) && (
												<Link to="/admin" className="text-sm text-black font-medium mr-3 hover:underline">Admin</Link>
											)}
												<button onClick={() => logout()} className="text-sm text-gray-700 hover:text-black">Logout</button>
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

