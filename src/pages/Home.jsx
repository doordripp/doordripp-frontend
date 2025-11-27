import { Hero, FastestDelivery, CustomerTestimonials } from '../layout'
import { CategoriesSection, NewArrivals, TopSelling } from '../features/catalog'

export default function Home() {
  return (
    <>
      <Hero />
      <FastestDelivery />
      <CategoriesSection />
      <NewArrivals />
      <TopSelling />
      <CustomerTestimonials />
    </>
  )
}
