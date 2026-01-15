import { ShoppingBag, Heart, CreditCard, Zap, CheckCircle, Package, MapPin, Truck, RotateCcw, Star } from 'lucide-react'

export default function HowItWorks() {
	const steps = [
		{
			number: 1,
			icon: ShoppingBag,
			title: "Browse Ready-to-Wear Fashion",
			description: "Explore a curated selection of clothes, footwear, and accessories on the Doordripp app or website. Every product you see is already stocked at Doordripp's own facility, ensuring instant availability and zero waiting."
		},
		{
			number: 2,
			icon: Heart,
			title: "Select Your Style",
			description: "Choose your preferred size, color, and design with clear product details. Doordripp focuses on high-demand, ready-to-wear fashion, making it easy to find the perfect outfit for last-minute plans, work, travel, or special occasions."
		},
		{
			number: 3,
			icon: CreditCard,
			title: "Fast & Secure Checkout",
			description: "Complete your order in just a few clicks using UPI, debit/credit cards, or cash on delivery (available in select areas). Our streamlined checkout is built for speed and convenience."
		},
		{
			number: 4,
			icon: Zap,
			title: "Instant In-House Order Processing",
			description: "Once the order is placed, it is immediately processed from Doordripp's in-stock inventory. Since we manage our own stock, there are no delays from third-party sellers or external warehouses."
		},
		{
			number: 5,
			icon: CheckCircle,
			title: "Quick Quality Inspection",
			description: "Each item undergoes a rapid in-house quality check to verify size, color, and condition. This ensures every product reaches you clean, accurate, and ready to wear."
		},
		{
			number: 6,
			icon: Package,
			title: "Secure Packing & Immediate Dispatch",
			description: "Orders are packed carefully using minimal, eco-friendly packaging. A nearby delivery partner is assigned right away, allowing dispatch within minutes of order confirmation."
		},
		{
			number: 7,
			icon: MapPin,
			title: "Live Order Tracking",
			description: "Track your order in real time from dispatch to doorstep. Live updates and a delivery countdown keep you informed every step of the way."
		},
		{
			number: 8,
			icon: Truck,
			title: "20–40 Minute Doorstep Delivery",
			description: "With inventory ready at our location and optimized delivery routes, Doordripp delivers your fashion essentials within 20–40 minutes."
		},
		{
			number: 9,
			icon: RotateCcw,
			title: "Easy Returns & Quick Exchanges",
			description: "If the fit or style isn't right, request a return or exchange directly through the app. Our simple and hassle-free process puts customer comfort first."
		},
		{
			number: 10,
			icon: Star,
			title: "Style That Keeps Coming Back",
			description: "After delivery, enjoy personalized recommendations, exclusive drops, and special offers—making every future Doordripp order faster, smarter, and more relevant."
		}
	]

	return (
		<div className="min-h-screen bg-white">
			{/* Hero Section */}
			<section className="bg-gradient-to-r from-black to-gray-800 text-white py-16 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-4">How Doordripp Works</h1>
					<p className="text-lg text-gray-300">Fast, reliable, and ready when you need it.</p>
				</div>
			</section>

			{/* Steps */}
			<div className="max-w-5xl mx-auto px-4 py-12">
				<div className="space-y-8">
					{steps.map((step, index) => {
						const IconComponent = step.icon
						return (
							<div key={index} className="flex gap-6">
								{/* Step Number & Icon */}
								<div className="flex flex-col items-center flex-shrink-0">
									<div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl mb-3">
										{step.number}
									</div>
									<IconComponent className="h-8 w-8 text-black" />
									{index < steps.length - 1 && (
										<div className="w-1 h-24 bg-gray-300 mt-4"></div>
									)}
								</div>

								{/* Content */}
								<div className="pb-8 pt-2 flex-1">
									<h2 className="text-2xl font-bold text-black mb-3">{step.title}</h2>
									<p className="text-gray-700 leading-relaxed text-lg">{step.description}</p>
								</div>
							</div>
						)
					})}
				</div>

				{/* Closing Statement */}
				<div className="mt-16 text-center bg-gradient-to-r from-gray-50 to-white border-2 border-black py-8 px-6 rounded-lg">
					<p className="text-xl text-gray-800 font-semibold">
						This is how Doordripp delivers fashion—fast, reliable, and ready when you need it.
					</p>
				</div>
			</div>

			{/* CTA Section */}
			<section className="bg-black text-white py-12 px-4 mt-16">
				<div className="max-w-2xl mx-auto text-center">
					<h2 className="text-3xl font-bold mb-4">Ready to Experience Fast Fashion?</h2>
					<p className="text-gray-300 mb-6">Download the Doordripp app and get your style delivered in 20–40 minutes.</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<a href="/" className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200">
							Start Shopping
						</a>
						<a href="/career" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors duration-200">
							Join Our Team
						</a>
					</div>
				</div>
			</section>
		</div>
	)
}
