// Enhanced Product Data for Complete E-commerce Experience
// All products are now fetched from the database via admin panel uploads

// Filter options for category pages
export const FILTER_OPTIONS = {
  categories: [
    { id: 'men', name: 'Men' },
    { id: 'women', name: 'Women' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'footwear', name: 'Footwear' }
  ],
  subcategories: [
    // Clothing
    { id: 't-shirts', name: 'T-shirts' },
    { id: 'shirts', name: 'Shirts' },
    { id: 'jeans', name: 'Jeans' },
    { id: 'jackets', name: 'Jackets' },
    { id: 'shorts', name: 'Shorts' },
    { id: 'hoodies', name: 'Hoodies' },
    { id: 'dresses', name: 'Dresses' },
    { id: 'suits', name: 'Suits' },
    { id: 'tops', name: 'Tops' },
    { id: 'outfits', name: 'Outfits' },
    { id: 'kurtis', name: 'Kurtis' },
    { id: 'casual-partywear', name: 'Casual Partywear' },
    // Accessories
    { id: 'bags', name: 'Bags' },
    { id: 'watches', name: 'Watches' },
    { id: 'belts', name: 'Belts' },
    { id: 'sunglasses', name: 'Sunglasses' },
    { id: 'wallets', name: 'Wallets' },
    { id: 'caps', name: 'Caps' },
    // Footwear
    { id: 'sneakers', name: 'Sneakers' },
    { id: 'boots', name: 'Boots' },
    { id: 'formal', name: 'Formal Shoes' },
    { id: 'sports', name: 'Sports Shoes' },
    { id: 'casual', name: 'Casual Shoes' },
    { id: 'sandals', name: 'Sandals' }
  ],
  priceRanges: [
    { min: 0, max: 500, label: '₹0 - ₹500' },
    { min: 500, max: 1000, label: '₹500 - ₹1000' },
    { min: 1000, max: 2000, label: '₹1000 - ₹2000' },
    { min: 2000, max: 5000, label: '₹2000 - ₹5000' },
    { min: 5000, max: 10000, label: '₹5000+' }
  ],
  colors: [
    { name: 'green', hex: '#00C12B', id: 'green' },
    { name: 'red', hex: '#F50606', id: 'red' },
    { name: 'yellow', hex: '#F5DD06', id: 'yellow' },
    { name: 'orange', hex: '#F57906', id: 'orange' },
    { name: 'lightblue', hex: '#06CAF5', id: 'lightblue' },
    { name: 'blue', hex: '#063AF5', id: 'blue' },
    { name: 'purple', hex: '#7D06F5', id: 'purple' },
    { name: 'pink', hex: '#F506A4', id: 'pink' },
    { name: 'white', hex: '#FFFFFF', id: 'white' },
    { name: 'black', hex: '#000000', id: 'black' }
  ],
  sizes: [
    { id: 'xx-small', name: 'XX-Small', short: 'XXS' },
    { id: 'x-small', name: 'X-Small', short: 'XS' },
    { id: 'small', name: 'Small', short: 'S' },
    { id: 'medium', name: 'Medium', short: 'M' },
    { id: 'large', name: 'Large', short: 'L' },
    { id: 'x-large', name: 'X-Large', short: 'XL' },
    { id: 'xx-large', name: 'XX-Large', short: 'XXL' },
    { id: '3x-large', name: '3X-Large', short: '3XL' },
    { id: '4x-large', name: '4X-Large', short: '4XL' },
    // Shoe sizes
    { id: '6', name: 'Size 6', short: '6' },
    { id: '7', name: 'Size 7', short: '7' },
    { id: '8', name: 'Size 8', short: '8' },
    { id: '9', name: 'Size 9', short: '9' },
    { id: '10', name: 'Size 10', short: '10' },
    { id: '11', name: 'Size 11', short: '11' },
    { id: '12', name: 'Size 12', short: '12' }
  ],
  dressStyles: [
    { id: 'casual', name: 'Casual' },
    { id: 'formal', name: 'Formal' },
    { id: 'party', name: 'Party' },
    { id: 'gym', name: 'Gym' },
    { id: 'sports', name: 'Sports' }
  ]
}

// Product categories - Used in admin and filters
export const CATEGORIES = [
  'Men',
  'Women', 
  'Accessories',
  'Footwear'
]

// Product subcategories
export const SUBCATEGORIES = {
  Men: ['T-shirts', 'Shirts', 'Jeans', 'Jackets', 'Shorts', 'Hoodies', 'Suits', 'Outfits', 'Kurtis', 'Casual Partywear'],
  Women: ['T-shirts', 'Shirts', 'Jeans', 'Jackets', 'Shorts', 'Hoodies', 'Dresses', 'Tops', 'Suits', 'Kurtis', 'Casual Partywear'],
  Accessories: ['Bags', 'Watches', 'Belts', 'Sunglasses', 'Wallets', 'Caps'],
  Footwear: ['Sneakers', 'Boots', 'Formal', 'Sports', 'Casual', 'Sandals']
}

// Empty arrays - All products now come from API/database
// These are kept for backward compatibility but will be empty
export const NEW_ARRIVALS = []
export const TOP_SELLING = []
export const MENS_PRODUCTS = []
export const WOMENS_PRODUCTS = []
export const ACCESSORIES_PRODUCTS = []
export const FOOTWEAR_PRODUCTS = []
export const ALL_PRODUCTS = []

// Category products mapping - empty, all from API
export const CATEGORY_PRODUCTS = {
  casual: [],
  men: [],
  women: [],
  accessories: [],
  footwear: []
}

// Default placeholder image for products without images
export const PLACEHOLDER_IMAGE = 'https://placeholder.com/400x400?text=No+Image'

// Helper to get first image or placeholder
export const getProductImage = (product) => {
  if (product?.images && product.images.length > 0) {
    return product.images[0]
  }
  if (product?.image) {
    return product.image
  }
  return PLACEHOLDER_IMAGE
}
