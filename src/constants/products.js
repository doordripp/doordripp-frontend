// Enhanced Product Data for Complete E-commerce Experience
// Comprehensive product catalog with categories, filters, and detailed information

// Import product images from assets
import blackTshirtImg from '../assets/image 7.png'  // Black T-shirt
import skinnyJeansImg from '../assets/image 8.png'  // Blue Jeans
import checkeredShirtImg from '../assets/image 9.png' // Checkered Shirt
import stripedTshirtImg from '../assets/image 10.png' // Orange/Black Striped T-shirt

// Top Selling Images
import stripedShirtImg from '../assets/image 11.png' // Green Striped Shirt
import orangeTshirtImg from '../assets/image 12.png' // Orange T-shirt with text
import bermudaShortsImg from '../assets/image 8 (1).png' // Blue Shorts
import fadedJeansImg from '../assets/image 7 (1).png' // Black Jeans

// Additional category images
import graphicTeeImg from '../assets/image 11 (1).png'
import poloShirtImg from '../assets/image 9 (1).png'
import casualShirtImg from '../assets/Rectangle 2.png'
import hoodieImg from '../assets/Rectangle 2 (1).png'

// Product images mapping
const PRODUCT_IMAGES = {
  // New Arrivals
  blackTshirt: blackTshirtImg,
  skinnyJeans: skinnyJeansImg,
  checkeredShirt: checkeredShirtImg,
  stripedTshirt: stripedTshirtImg,
  
  // Top Selling
  stripedShirt: stripedShirtImg,
  orangeTshirt: orangeTshirtImg,
  bermudaShorts: bermudaShortsImg,
  fadedJeans: fadedJeansImg
}

// Star ratings component data
const createRating = (rating, reviews) => ({
  rating,
  reviews,
  stars: Array.from({ length: 5 }, (_, i) => i < Math.floor(rating))
})

// New Arrivals Products
export const NEW_ARRIVALS = [
  {
    id: 'na-1',
    name: 'T-shirt with Tape Details',
    image: PRODUCT_IMAGES.blackTshirt,
    price: 120,
    originalPrice: null,
    discount: null,
    rating: createRating(4.5, 451),
    category: 'casual',
    subcategory: 'T-shirts',
    colors: ['#000000', '#FFFFFF', '#808080'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: true
  },
  {
    id: 'na-2', 
    name: 'Skinny Fit Jeans',
    image: PRODUCT_IMAGES.skinnyJeans,
    price: 240,
    originalPrice: 260,
    discount: 20,
    rating: createRating(3.5, 3143),
    category: 'casual',
    subcategory: 'Jeans',
    colors: ['#4169E1', '#000000'],
    sizes: ['28', '30', '32', '34', '36'],
    isNew: true
  },
  {
    id: 'na-3',
    name: 'Checkered Shirt',
    image: PRODUCT_IMAGES.checkeredShirt,
    price: 180,
    originalPrice: null,
    discount: null,
    rating: createRating(4.5, 143),
    category: 'casual',
    subcategory: 'Shirts',
    colors: ['#FF0000', '#0000FF', '#008000'],
    sizes: ['S', 'M', 'L', 'XL'],
    isNew: true
  },
  {
    id: 'na-4',
    name: 'Sleeve Striped T-shirt',
    image: PRODUCT_IMAGES.stripedTshirt,
    price: 130,
    originalPrice: 160,
    discount: 30,
    rating: createRating(4.5, 417),
    category: 'casual',
    subcategory: 'T-shirts',
    colors: ['#FFA500', '#000000', '#FFFFFF'],
    sizes: ['S', 'M', 'L', 'XL'],
    isNew: true
  }
]

// Top Selling Products
export const TOP_SELLING = [
  {
    id: 'ts-1',
    name: 'Vertical Striped Shirt',
    image: PRODUCT_IMAGES.stripedShirt,
    price: 212,
    originalPrice: 232,
    discount: 20,
    rating: createRating(5.0, 2143),
    category: 'casual',
    subcategory: 'Shirts',
    colors: ['#008000', '#0000FF', '#FFFFFF'],
    sizes: ['S', 'M', 'L', 'XL'],
    isTopSelling: true
  },
  {
    id: 'ts-2',
    name: 'Courage Graphic T-shirt',
    image: PRODUCT_IMAGES.orangeTshirt,
    price: 145,
    originalPrice: null,
    discount: null,
    rating: createRating(4.0, 1043),
    category: 'casual',
    subcategory: 'T-shirts',
    colors: ['#FFA500', '#FFFFFF', '#000000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isTopSelling: true
  },
  {
    id: 'ts-3',
    name: 'Loose Fit Bermuda Shorts',
    image: PRODUCT_IMAGES.bermudaShorts,
    price: 80,
    originalPrice: null,
    discount: null,
    rating: createRating(3.0, 234),
    category: 'casual',
    subcategory: 'Shorts',
    colors: ['#4169E1', '#8B4513', '#000000'],
    sizes: ['S', 'M', 'L', 'XL'],
    isTopSelling: true
  },
  {
    id: 'ts-4',
    name: 'Faded Skinny Jeans',
    image: PRODUCT_IMAGES.fadedJeans,
    price: 210,
    originalPrice: null,
    discount: null,
    rating: createRating(4.5, 567),
    category: 'casual',
    subcategory: 'Jeans',
    colors: ['#000000', '#4169E1'],
    sizes: ['28', '30', '32', '34', '36'],
    isTopSelling: true
  }
]

// Comprehensive Category Products for Category Pages
export const CATEGORY_PRODUCTS = {
  casual: [
    {
      id: 'casual-1',
      name: 'Gradient Graphic T-shirt',
      image: graphicTeeImg,
      price: 145,
      originalPrice: null,
      discount: null,
      rating: { rating: 3.5, reviews: 450 },
      category: 'casual',
      subcategory: 'T-shirts',
      colors: ['white', 'black', 'gray'],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    {
      id: 'casual-2',
      name: 'Polo with Tipping Details',
      image: poloShirtImg,
      price: 180,
      originalPrice: null,
      discount: null,
      rating: { rating: 4.5, reviews: 267 },
      category: 'casual',
      subcategory: 'Shirts',
      colors: ['burgundy', 'navy', 'white'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 'casual-3',
      name: 'Black Striped T-shirt',
      image: stripedTshirtImg,
      price: 120,
      originalPrice: 150,
      discount: 20,
      rating: { rating: 5.0, reviews: 189 },
      category: 'casual',
      subcategory: 'T-shirts',
      colors: ['black', 'white'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'casual-4',
      name: 'Skinny Fit Jeans',
      image: skinnyJeansImg,
      price: 240,
      originalPrice: 260,
      discount: 8,
      rating: { rating: 3.5, reviews: 3456 },
      category: 'casual',
      subcategory: 'Jeans',
      colors: ['blue', 'black'],
      sizes: ['28', '30', '32', '34', '36']
    },
    {
      id: 'casual-5',
      name: 'Checkered Shirt',
      image: checkeredShirtImg,
      price: 180,
      originalPrice: null,
      discount: null,
      rating: { rating: 4.5, reviews: 654 },
      category: 'casual',
      subcategory: 'Shirts',
      colors: ['red', 'blue', 'green'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 'casual-6',
      name: 'Sleeve Striped T-shirt',
      image: stripedTshirtImg,
      price: 130,
      originalPrice: 160,
      discount: 19,
      rating: { rating: 4.5, reviews: 234 },
      category: 'casual',
      subcategory: 'T-shirts',
      colors: ['orange', 'blue', 'black'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 'casual-7',
      name: 'Vertical Striped Shirt',
      image: stripedShirtImg,
      price: 212,
      originalPrice: 232,
      discount: 9,
      rating: { rating: 5.0, reviews: 876 },
      category: 'casual',
      subcategory: 'Shirts',
      colors: ['green', 'blue'],
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 'casual-8',
      name: 'Courage Graphic T-shirt',
      image: orangeTshirtImg,
      price: 145,
      originalPrice: null,
      discount: null,
      rating: { rating: 4.0, reviews: 432 },
      category: 'casual',
      subcategory: 'T-shirts',
      colors: ['orange', 'white', 'black'],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    {
      id: 'casual-9',
      name: 'Loose Fit Bermuda Shorts',
      image: bermudaShortsImg,
      price: 80,
      originalPrice: null,
      discount: null,
      rating: { rating: 3.0, reviews: 198 },
      category: 'casual',
      subcategory: 'Shorts',
      colors: ['blue', 'khaki', 'black'],
      sizes: ['S', 'M', 'L', 'XL']
    }
  ]
}

// Filter options for category pages
export const FILTER_OPTIONS = {
  subcategories: [
    { id: 't-shirts', name: 'T-shirts', count: 4 },
    { id: 'shorts', name: 'Shorts', count: 1 },
    { id: 'shirts', name: 'Shirts', count: 3 },
    { id: 'hoodie', name: 'Hoodie', count: 0 },
    { id: 'jeans', name: 'Jeans', count: 1 }
  ],
  priceRanges: [
    { min: 50, max: 100, label: '$50 - $100' },
    { min: 100, max: 200, label: '$100 - $200' },
    { min: 200, max: 300, label: '$200 - $300' }
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
    { id: '4x-large', name: '4X-Large', short: '4XL' }
  ],
  dressStyles: [
    { id: 'casual', name: 'Casual' },
    { id: 'formal', name: 'Formal' },
    { id: 'party', name: 'Party' },
    { id: 'gym', name: 'Gym' }
  ]
}

// Combined products for search/filtering
export const ALL_PRODUCTS = [...NEW_ARRIVALS, ...TOP_SELLING, ...CATEGORY_PRODUCTS.casual]

// Product categories
export const CATEGORIES = [
  'T-Shirts',
  'Jeans', 
  'Shirts',
  'Shorts',
  'Hoodie'
]