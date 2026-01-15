import { Zap, Shirt, MapPin, Sparkles, MapPinCheck, CheckCircle, RotateCcw, CreditCard, Gift, Leaf, Star } from 'lucide-react'

export default function Features() {
	const features = [
		{
			icon: Zap,
			title: "Fashion Delivered in 20–40 Minutes",
			description: "No waiting. No planning ahead. Doordripp brings clothes, footwear, and accessories straight to your door in as little as 20 minutes, powered by hyperlocal fashion hubs and lightning-fast delivery partners."
		},
		{
			icon: Shirt,
			title: "Everything Fashion. One Platform.",
			description: "From everyday essentials to last-minute outfits:",
			items: [
				"Clothing – casual, party, ethnic, office, streetwear",
				"Footwear – sneakers, heels, formals, sports shoes",
				"Accessories – watches, bags, belts, sunglasses & more",
				"One app. One checkout. Zero hassle."
			]
		},
		{
			icon: MapPin,
			title: "Hyperlocal Fashion Hubs",
			description: "We don't ship from faraway warehouses. Doordripp uses city-based micro style hubs, stocked with trending items near you — enabling faster delivery and fresher fashion."
		},
		{
			icon: Sparkles,
			title: "Smart Style Suggestions (Unique to Doordripp)",
			description: "Not sure what to wear? We've got you.",
			items: [
				"Instant outfit suggestions by occasion & trend",
				"\"Style Now\" picks complete looks in seconds",
				"Daily updated trending styles — not outdated catalogs"
			]
		},
		{
			icon: MapPinCheck,
			title: "Live Delivery Tracking",
			description: "Full transparency from click to doorstep:",
			items: [
				"Order packed instantly",
				"Rider dispatched in minutes",
				"Live countdown till arrival",
				"You always know when your drip arrives."
			]
		},
		{
			icon: CheckCircle,
			title: "Quality-Checked Before Dispatch",
			description: "Every order goes through a quick inspection:",
			items: [
				"Correct size & color",
				"Damage-free & wearable condition",
				"Secure, minimal packaging",
				"Arrives ready to wear — not ready to return."
			]
		},
		{
			icon: RotateCcw,
			title: "Easy Returns & Quick Swaps",
			description: "Didn't like the fit?",
			items: [
				"Simple exchange & return flow",
				"Fast pickup support",
				"Customer-first assistance",
				"Because fast fashion should also be easy fashion."
			]
		},
		{
			icon: CreditCard,
			title: "Fast & Flexible Payments",
			description: "Pay your way:",
			items: [
				"UPI (GPay, PhonePe, Paytm)",
				"Debit / Credit Cards",
				"Cash on Delivery (select areas)",
				"Checkout in seconds."
			]
		},
		{
			icon: Gift,
			title: "Flash Drops & Limited Drips",
			description: "Exclusive to Doordripp:",
			items: [
				"Time-limited fashion drops",
				"City-exclusive styles",
				"Countdown deals you don't want to miss",
				"Once it's gone — it's gone."
			]
		},
		{
			icon: Leaf,
			title: "Built for a Smarter Future",
			description: "Shorter delivery routes = lower emissions",
			items: [
				"Local sourcing supports nearby sellers",
				"Minimal, eco-friendly packaging",
				"Fast fashion, done responsibly."
			]
		}
	]

	const benefits = [
		"Fashion in 20–40 minutes",
		"Clothes, footwear & accessories in one place",
		"Smart styling, not endless scrolling",
		"Hyperlocal, fast & reliable"
	]

	return (
		<div className="min-h-screen bg-white">
			{/* Hero Section */}
			<section className="bg-gradient-to-r from-black to-gray-800 text-white py-16 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Doordripp?</h1>
					<p className="text-lg text-gray-300">Your Style. Delivered Instantly.</p>
				</div>
			</section>

			{/* Main Content */}
			<div className="max-w-6xl mx-auto px-4 py-12">
				{/* Features Grid */}
				<div className="space-y-8 mb-12">
					{features.map((feature, index) => {
						const IconComponent = feature.icon
						return (
							<div key={index} className="border-l-4 border-black pl-6 pb-6">
								<div className="flex items-start gap-4 mb-3">
									<IconComponent className="h-8 w-8 text-black flex-shrink-0 mt-1" />
									<h2 className="text-2xl font-bold text-black">{feature.title}</h2>
								</div>
								<p className="text-gray-700 mb-3">{feature.description}</p>
								{feature.items && (
									<ul className="space-y-2 ml-4">
										{feature.items.map((item, itemIndex) => (
											<li key={itemIndex} className="flex items-start gap-2 text-gray-700">
												<span className="text-black font-bold">•</span>
												<span>{item}</span>
											</li>
										))}
									</ul>
								)}
							</div>
						)
					})}
				</div>

				{/* Benefits Section */}
				<section className="bg-black text-white py-12 px-8 rounded-lg mb-12">
					<div className="flex items-start gap-3 mb-6">
										<Star className="h-8 w-8 text-white flex-shrink-0" />
										<h2 className="text-3xl font-bold">Why Choose Doordripp?</h2>
									</div>
					<div className="grid md:grid-cols-2 gap-4">
						{benefits.map((benefit, index) => (
							<div key={index} className="flex items-start gap-3">
								<CheckCircle className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
								<span className="text-lg">{benefit}</span>
							</div>
						))}
					</div>
				</section>

				{/* Tagline Section */}
				<section className="text-center py-8">
					<h2 className="text-3xl font-bold text-black mb-2">Doordripp</h2>
					<p className="text-xl text-gray-700">Your Style. Delivered Instantly.</p>
				</section>
			</div>
		</div>
	)
}
