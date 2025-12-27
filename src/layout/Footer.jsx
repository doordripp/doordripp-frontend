import { Link } from 'react-router-dom'
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  Github, 
  CreditCard, 
  Smartphone 
} from 'lucide-react'

// Footer navigation data
const FOOTER_LINKS = {
  COMPANY: [
    { name: 'About', href: '/about' },
    { name: 'Features', href: '/features' },
    { name: 'Works', href: '/works' },
    { name: 'Career', href: '/career' }
  ],
  CATEGORIES: [
    { name: 'All Categories', href: '/category?category=casual' },
    { name: 'Men', href: '/category?gender=men' },
    { name: 'Women', href: '/category?gender=women' },
    { name: 'Accessories', href: '/category?category=accessories' },
    { name: 'Footwear', href: '/category?category=footwear' }
  ],
  HELP: [
    { name: 'Customer Support', href: '/support' },
    { name: 'Delivery Details', href: '/delivery' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' }
  ],
  FAQ: [
    { name: 'Account', href: '/account' },
    { name: 'Manage Deliveries', href: '/deliveries' },
    { name: 'Orders', href: '/orders' },
    { name: 'Payments', href: '/payments' }
  ],
 
}

// Payment method icons
const PAYMENT_METHODS = [
  { name: 'Visa', icon: CreditCard, color: 'text-blue-600' },
  { name: 'Mastercard', icon: CreditCard, color: 'text-red-600' },
  { name: 'PayPal', icon: CreditCard, color: 'text-blue-500' },
  { name: 'Apple Pay', icon: Smartphone, color: 'text-gray-800' },
  { name: 'Google Pay', icon: Smartphone, color: 'text-green-600' }
]

// Social media links
const SOCIAL_LINKS = [
  { name: 'Twitter', icon: Twitter, href: 'https://x.com/doordripp?t=C3ZAb5wjDvzzHv_kq7MV9A&s=08', color: 'hover:text-blue-400' },
  { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/share/17LxQTctXf/', color: 'hover:text-blue-600' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/doordripp?igsh=MXI3MXJibjUweWx1YQ==&utm_source=ig_contact_invite', color: 'hover:text-pink-600' },
  { name: 'Github', icon: Github, href: ' https://share.google/In9Ewu4VEMQjnJolv', color: 'hover:text-gray-800' }
]

function FooterColumn({ title, links }) {
  return (
    <div className="space-y-4">
      <h4 className="text-base font-bold text-black uppercase tracking-wider">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <Link 
              to={link.href}
              className="text-gray-600 text-base transition-colors duration-200 hover:text-black"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="text-3xl font-extrabold text-black tracking-wide">
              DOORDRIPP
            </Link>
            <p className="text-gray-600 text-base max-w-xs leading-relaxed">
              The fastest way to wear it. Shop clothes and accessories and get doorstep delivery in minutes.
            </p>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full bg-white border border-gray-200 text-gray-600 transition-all duration-200 ${social.color} hover:scale-110 hover:shadow-md`}
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <FooterColumn title="COMPANY" links={FOOTER_LINKS.COMPANY} />
          <FooterColumn title="CATEGORIES" links={FOOTER_LINKS.CATEGORIES} />
          <FooterColumn title="HELP" links={FOOTER_LINKS.HELP} />
          
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Copyright */}
            <div className="text-gray-600 text-sm">
              © 2000-{new Date().getFullYear()}, DOORDRIPP.com, Inc. All rights reserved
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 mr-2">Accepted payments:</span>
              <div className="flex items-center gap-2">
                {PAYMENT_METHODS.map((method, index) => (
                  <div
                    key={method.name}
                    className={`p-2 rounded-lg bg-white border border-gray-200 ${method.color} transition-all duration-200 hover:scale-105 hover:shadow-sm`}
                    title={method.name}
                  >
                    <method.icon className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}