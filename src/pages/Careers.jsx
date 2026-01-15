import { Mail } from 'lucide-react'

export default function Careers() {
	return (
		<div className="min-h-screen bg-white">
			{/* Hero Section */}
			<section className="bg-gradient-to-r from-black to-gray-800 text-white py-16 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-4">Career at Doordripp</h1>
					<p className="text-lg text-gray-300">Build fast. Think fashion. Deliver instantly.</p>
				</div>
			</section>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-4 py-12">
				{/* Introduction */}
				<section className="mb-12">
					<p className="text-gray-700 text-lg leading-relaxed mb-4">
						At Doordripp, we're building the future of instant fashion—where style meets speed. If you're passionate about fashion, technology, operations, or creating seamless customer experiences, Doordripp is the place for you. We're a fast-growing company driven by innovation, ownership, and execution, and we're always looking for motivated people who want to build something impactful from the ground up.
					</p>
					<p className="text-gray-700 text-lg leading-relaxed">
						We believe great teams create great products. At Doordripp, you'll work in a high-energy startup environment where ideas matter, decisions move fast, and your work directly shapes how customers experience fashion. From managing in-house inventory and optimizing rapid deliveries to designing intuitive digital experiences and crafting trend-forward collections, every role plays a key part in our success.
					</p>
				</section>

				{/* Why Work With Us */}
				<section className="mb-12">
					<h2 className="text-3xl font-bold mb-6 text-black">Why Work With Us</h2>
					<ul className="space-y-3">
						<li className="flex items-start gap-3">
							<span className="text-black font-bold text-xl">•</span>
							<span className="text-gray-700">Be part of a fast-scaling fashion and delivery startup</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-black font-bold text-xl">•</span>
							<span className="text-gray-700">Work on real-world problems with visible impact</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-black font-bold text-xl">•</span>
							<span className="text-gray-700">Opportunity to grow, learn, and take ownership early</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-black font-bold text-xl">•</span>
							<span className="text-gray-700">Collaborative, transparent, and performance-driven culture</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-black font-bold text-xl">•</span>
							<span className="text-gray-700">Competitive pay with growth-based incentives</span>
						</li>
					</ul>
				</section>

				{/* Opportunities */}
				<section className="mb-12">
					<h2 className="text-3xl font-bold mb-6 text-black">Opportunities at Doordripp</h2>
					<p className="text-gray-700 mb-6">We hire across multiple teams, including:</p>
					<div className="grid md:grid-cols-2 gap-4">
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="font-semibold text-black mb-2">Operations & Inventory Management</h3>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="font-semibold text-black mb-2">Fashion Buying & Merchandising</h3>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="font-semibold text-black mb-2">Technology & Product Development</h3>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="font-semibold text-black mb-2">Marketing, Growth & Brand</h3>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="font-semibold text-black mb-2">Customer Support & Experience</h3>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="font-semibold text-black mb-2">Delivery & Logistics Operations</h3>
						</div>
					</div>
				</section>

				{/* Call to Action */}
				<section className="mb-12">
					<p className="text-gray-700 mb-6">
						Whether you're a creative thinker, problem solver, or execution-focused operator, Doordripp offers a platform to grow your career while redefining how fashion is delivered.
					</p>
				</section>

				{/* Join Us Section */}
				<section className="bg-black text-white py-12 px-8 rounded-lg text-center">
					<Mail className="h-12 w-12 mx-auto mb-4" />
					<h2 className="text-3xl font-bold mb-4">Join Us</h2>
					<p className="text-lg mb-6">
						If you're ready to move fast, think bold, and help deliver style in minutes, we'd love to hear from you.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<a 
							href="mailto:support@doordripp.com" 
							className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
						>
							<Mail className="h-5 w-5" />
							Send Your Resume
						</a>
					</div>
					<p className="text-gray-400 text-sm mt-4">
						Email us at: <a href="mailto:support@doordripp.com" className="underline hover:text-gray-300">support@doordripp.com</a>
					</p>
				</section>
			</div>
		</div>
	)
}
