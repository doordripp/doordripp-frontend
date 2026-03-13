import { Hero, FastestDelivery } from '../layout'
import { CategoriesSection, NewArrivals, TopSelling, PopularProducts, FootwearSection, AccessoriesSection } from '../features/catalog'
import FloatingDrippAssist from '../components/support/FloatingDrippAssist'

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
      <FloatingDrippAssist />
    </>
  )
}
