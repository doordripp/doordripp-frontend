// Import images from src/assets (as requested)
// Current files present in assets:
// - image 11.png (men)
// - image 12.png (women)
// - Rectangle 9.png (accessories triangle)
// - Rectangle 8.png (footwear triangle)
import menImg from '../assets/image 11.png'
import womenImg from '../assets/image 12.png'
import accessoriesImg from '../assets/Rectangle 8.png'
import footwearImg from '../assets/Rectangle 9.png'

export const CATEGORY_IMAGES = {
  men: menImg,
  women: womenImg,
  accessories: accessoriesImg,
  footwear: footwearImg,
}

export const CATEGORIES = [
  { key: 'men', title: 'Men', href: '/category?category=casual', img: CATEGORY_IMAGES.men },
  { key: 'women', title: 'Women', href: '/category?category=casual', img: CATEGORY_IMAGES.women },
  { key: 'accessories', title: 'Accessories', href: '/category?category=casual', img: CATEGORY_IMAGES.accessories },
  { key: 'footwear', title: 'Footwear', href: '/category?category=casual', img: CATEGORY_IMAGES.footwear },
]
