import { Hero, FastestDelivery, CustomerTestimonials } from '../layout'
import { CategoriesSection, NewArrivals, TopSelling, PopularProducts, FootwearSection, AccessoriesSection } from '../features/catalog'

export default function Home() {
  return (
    <>
      <Hero />
      <FastestDelivery />
      <CategoriesSection />
      <NewArrivals />
      <TopSelling />
      <PopularProducts />
      <FootwearSection />
      <AccessoriesSection />
      <CustomerTestimonials />
    </>
  )
}
