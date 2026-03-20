import { Link } from 'react-router-dom'
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  Github, 
  CreditCard, 
  Smartphone 
} from 'lucide-react'
import useScrollReveal from '../hooks/useScrollReveal'

const FOOTER_LINKS = {
  COMPANY: [
    { name: 'About',    href: '/about' },
    { name: 'Features', href: '/features' },
    { name: 'Works',    href: '/works' },
    { name: 'Career',   href: '/career' },
  ],
  CATEGORIES: [
    { name: 'All Categories', href: '/category?category=casual' },
    { name: 'Men',            href: '/category?gender=men' },
    { name: 'Women',          href: '/category?gender=women' },
    { name: 'Accessories',    href: '/category?category=accessories' },
    { name: 'Footwear',       href: '/category?category=footwear' },
  ],
  HELP: [
    { name: 'Customer Support', href: '/support' },
    { name: 'Delivery Details', href: '/delivery' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy',   href: '/privacy' },
  ],
}

const PAYMENT_METHODS = [
  { name: 'Visa',       icon: CreditCard, color: 'text-blue-400' },
  { name: 'Mastercard', icon: CreditCard, color: 'text-red-400' },
  { name: 'PayPal',     icon: CreditCard, color: 'text-blue-300' },
  { name: 'Apple Pay',  icon: Smartphone, color: 'text-gray-300' },
  { name: 'Google Pay', icon: Smartphone, color: 'text-green-400' },
]

const SOCIAL_LINKS = [
  { name: 'Twitter',   icon: Twitter,   href: 'https://x.com/doordripp?t=C3ZAb5wjDvzzHv_kq7MV9A&s=08' },
  { name: 'Facebook',  icon: Facebook,  href: 'https://www.facebook.com/share/17LxQTctXf/' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/doordripp?igsh=MXI3MXJibjUweWx1YQ==&utm_source=ig_contact_invite' },
  { name: 'Github',    icon: Github,    href: ' https://share.google/In9Ewu4VEMQjnJolv' },
]

function FooterColumn({ title, links }) {
  return (
    <div className="space-y-5">
      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              to={link.href}
              className="text-sm text-neutral-400 transition-colors duration-200 hover:text-white link-underline"
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
  const ref = useScrollReveal({ threshold: 0.05 })

  return (
    <footer className="w-full bg-neutral-950 text-white" ref={ref}>
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6 reveal">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="text-2xl font-black uppercase tracking-[0.12em] text-white">
              DOORDRIPP
            </Link>
            <p className="text-sm text-neutral-400 max-w-xs leading-relaxed">
              The fastest way to wear it. Shop clothes and accessories and get doorstep delivery in minutes.
            </p>

            {/* Social Icons — sharp squares */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center border border-neutral-700 text-neutral-400 hover:border-white hover:text-white transition-all duration-200 hover:scale-105"
                  style={{ borderRadius: 0 }}
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <FooterColumn title="Company"    links={FOOTER_LINKS.COMPANY} />
          <FooterColumn title="Categories" links={FOOTER_LINKS.CATEGORIES} />
          <FooterColumn title="Help"       links={FOOTER_LINKS.HELP} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="text-xs text-neutral-500 tracking-wide">
              ©{new Date().getFullYear()} DOORDRIPP.com, Inc. All rights reserved.
            </div>

            {/* Payment icons */}
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] text-neutral-600 uppercase tracking-wider">Payments:</span>
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.name}
                  className={`p-1.5 border border-neutral-700 ${method.color} transition-all duration-200 hover:border-neutral-500`}
                  style={{ borderRadius: 0 }}
                  title={method.name}
                >
                  <method.icon className="h-3.5 w-3.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}