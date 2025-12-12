import { Hero, FastestDelivery, CustomerTestimonials } from '../layout'
import { CategoriesSection, NewArrivals, TopSelling } from '../features/catalog'
import { useAuth } from '../context/AuthContext'
import { hasAdminAccess } from '../utils/roleUtils'

export default function Home() {
  const { user } = useAuth()
  return (
    <>
      {hasAdminAccess(user) && (
        <div className="w-full bg-yellow-50 border-l-4 border-yellow-400 p-3">
          <div className="max-w-6xl mx-auto text-sm text-yellow-800 flex items-center justify-between">
            <div>
              <strong className="font-medium">Admin</strong>: You are signed-in with an admin account.
            </div>
            <div>
              <a href="/admin" className="underline font-semibold">Open Admin Panel</a>
            </div>
          </div>
        </div>
      )}
      <Hero />
      <FastestDelivery />
      <CategoriesSection />
      <NewArrivals />
      <TopSelling />
      <CustomerTestimonials />
    </>
  )
}
