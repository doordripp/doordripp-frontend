// Enhanced Product Data for Complete E-commerce Experience
// Comprehensive product catalog with categories, filters, and detailed information

// Import product images from assets
import blackTshirtImg from '../assets/image 7.png'
import skinnyJeansImg from '../assets/image 8.png'
import checkeredShirtImg from '../assets/image 9.png'
import stripedTshirtImg from '../assets/image 10.png'

// Top Selling Images
import stripedShirtImg from '../assets/image 11.png'
import orangeTshirtImg from '../assets/image 12.png'
import bermudaShortsImg from '../assets/image 8 (1).png'
import fadedJeansImg from '../assets/image 7 (1).png'

// Additional category images
import graphicTeeImg from '../assets/image 11 (1).png'
import poloShirtImg from '../assets/image 9 (1).png'
import casualShirtImg from '../assets/Rectangle 2.png'
import hoodieImg from '../assets/Rectangle 2 (1).png'

// Men's clothing
import mensImg1 from '../assets/4909eefdd4938899f2419357de98781c.jpg'
import mensImg2 from '../assets/4cb1497a8350a0f0cc8239a6845076a4.jpg'
import mensImg3 from '../assets/9b2990de04e99aa5154207de6d62b46f.jpg'
import mensImg4 from '../assets/b2fa1e773bf84519023d806147eb20ae.jpg'

// Women's clothing
import womensImg1 from '../assets/aba82f1ac48b7d970fbe94ff4f35a24a.jpg'
import womensImg2 from '../assets/bcba29523514afda81669aadfc1e6838.jpg'
import womensImg3 from '../assets/ea4cb70a854b3e148ddc9f7c1fae6bf8.jpg'
import womensImg4 from '../assets/d4adf6cc494b5da71bd372cb7be89fd2.jpg'

// Accessories
import accessoriesImg1 from '../assets/300ce70937bb2f31d700c335c9c731aa.jpg'
import accessoriesImg2 from '../assets/792d28d6f0f696c51c2c43dd67410fe3.jpg'
import accessoriesImg3 from '../assets/b81bf357484b07404ffeea64fc09ba1d.jpg'
import accessoriesImg4 from '../assets/d6754f3e9e6c14d3d5b308d69a022452.jpg'

// Footwear
import footwearImg1 from '../assets/b26fea69ccfd8aa5825862cdb9604a4fb4930464.jpg'
import footwearImg2 from '../assets/Frame 38.png'
import footwearImg3 from '../assets/Rectangle 8.png'
import footwearImg4 from '../assets/Rectangle 9.png'

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
  fadedJeans: fadedJeansImg,
  
  // Additional products
  graphicTee: graphicTeeImg,
  poloShirt: poloShirtImg,
  casualShirt: casualShirtImg,
  hoodie: hoodieImg,
  
  // Men's
  mensShirt: mensImg1,
  mensJacket: mensImg2,
  mensPants: mensImg3,
  mensCasual: mensImg4,
  
  // Women's
  womensDress: womensImg1,
  womensTop: womensImg2,
  womensJeans: womensImg3,
  womensBlouse: womensImg4,
  
  // Accessories
  bag: accessoriesImg1,
  watch: accessoriesImg2,
  sunglasses: accessoriesImg3,
  belt: accessoriesImg4,
  
  // Footwear
  sneakers: footwearImg1,
  boots: footwearImg2,
  loafers: footwearImg3,
  sandals: footwearImg4,
  
  // Aliases for variety
  denimJacket: mensImg2,
  shorts: bermudaShortsImg
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
    images: [PRODUCT_IMAGES.blackTshirt, graphicTeeImg],
    price: 120,
    originalPrice: null,
    discount: null,
    rating: createRating(4.5, 451),
    category: 'casual',
    subcategory: 'T-shirts',
    colors: ['#000000', '#FFFFFF', '#808080'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 100,
    isNew: true
  },
  {
    id: 'na-2', 
    name: 'Skinny Fit Jeans',
    image: PRODUCT_IMAGES.skinnyJeans,
    images: [PRODUCT_IMAGES.skinnyJeans, fadedJeansImg],
    price: 240,
    originalPrice: 260,
    discount: 20,
    rating: createRating(3.5, 3143),
    category: 'casual',
    subcategory: 'Jeans',
    colors: ['#4169E1', '#000000'],
    sizes: ['28', '30', '32', '34', '36'],
    stock: 100,
    isNew: true
  },
  {
    id: 'na-3',
    name: 'Checkered Shirt',
    image: PRODUCT_IMAGES.checkeredShirt,
    images: [PRODUCT_IMAGES.checkeredShirt, poloShirtImg],
    price: 180,
    originalPrice: null,
    discount: null,
    rating: createRating(4.5, 143),
    category: 'casual',
    subcategory: 'Shirts',
    colors: ['#FF0000', '#0000FF', '#008000'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100,
    isNew: true
  },
  {
    id: 'na-4',
    name: 'Sleeve Striped T-shirt',
    image: PRODUCT_IMAGES.stripedTshirt,
    images: [PRODUCT_IMAGES.stripedTshirt, PRODUCT_IMAGES.stripedShirt],
    price: 130,
    originalPrice: 160,
    discount: 30,
    rating: createRating(4.5, 417),
    category: 'casual',
    subcategory: 'T-shirts',
    colors: ['#FFA500', '#000000', '#FFFFFF'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100,
    isNew: true
  },
  {
    id: 'na-5',
    name: 'Classic Denim Jacket',
    image: PRODUCT_IMAGES.denimJacket,
    images: [PRODUCT_IMAGES.denimJacket],
    price: 350,
    originalPrice: 400,
    discount: 15,
    rating: createRating(4.7, 289),
    category: 'casual',
    subcategory: 'Jackets',
    colors: ['#4169E1', '#1C1C1C'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100,
    isNew: true
  },
  {
    id: 'na-6',
    name: 'Cotton Polo Shirt',
    image: PRODUCT_IMAGES.poloShirt,
    images: [PRODUCT_IMAGES.poloShirt],
    price: 150,
    originalPrice: null,
    discount: null,
    rating: createRating(4.3, 198),
    category: 'casual',
    subcategory: 'Shirts',
    colors: ['#000080', '#FFFFFF', '#DC143C'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 100,
    isNew: true
  },
  {
    id: 'na-7',
    name: 'Casual Shorts',
    image: PRODUCT_IMAGES.shorts,
    images: [PRODUCT_IMAGES.shorts],
    price: 95,
    originalPrice: 120,
    discount: 20,
    rating: createRating(4.2, 342),
    category: 'casual',
    subcategory: 'Shorts',
    colors: ['#8B4513', '#000000', '#696969'],
    sizes: ['28', '30', '32', '34', '36'],
    stock: 100,
    isNew: true
  },
  {
    id: 'na-8',
    name: 'Hooded Sweatshirt',
    image: PRODUCT_IMAGES.hoodie,
    images: [PRODUCT_IMAGES.hoodie],
    price: 280,
    originalPrice: 320,
    discount: 12,
    rating: createRating(4.6, 521),
    category: 'casual',
    subcategory: 'Hoodies',
    colors: ['#808080', '#000000', '#000080'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 100,
    isNew: true
  }
]

// Top Selling Products
export const TOP_SELLING = [
  {
    id: 'ts-1',
    name: 'Vertical Striped Shirt',
    image: PRODUCT_IMAGES.stripedShirt,
    images: [PRODUCT_IMAGES.stripedShirt, casualShirtImg],
    price: 212,
    originalPrice: 232,
    discount: 20,
    rating: createRating(5.0, 2143),
    category: 'casual',
    subcategory: 'Shirts',
    colors: ['#008000', '#0000FF', '#FFFFFF'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100,
    isTopSelling: true
  },
  {
    id: 'ts-2',
    name: 'Courage Graphic T-shirt',
    image: PRODUCT_IMAGES.orangeTshirt,
    images: [PRODUCT_IMAGES.orangeTshirt, graphicTeeImg],
    price: 145,
    originalPrice: null,
    discount: null,
    rating: createRating(4.0, 1043),
    category: 'casual',
    subcategory: 'T-shirts',
    colors: ['#FFA500', '#FFFFFF', '#000000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 100,
    isTopSelling: true
  },
  {
    id: 'ts-3',
    name: 'Loose Fit Bermuda Shorts',
    image: PRODUCT_IMAGES.bermudaShorts,
    images: [PRODUCT_IMAGES.bermudaShorts, fadedJeansImg],
    price: 80,
    originalPrice: null,
    discount: null,
    rating: createRating(3.0, 234),
    category: 'casual',
    subcategory: 'Shorts',
    colors: ['#4169E1', '#8B4513', '#000000'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100,
    isTopSelling: true
  },
  {
    id: 'ts-4',
    name: 'Faded Skinny Jeans',
    image: PRODUCT_IMAGES.fadedJeans,
    images: [PRODUCT_IMAGES.fadedJeans, PRODUCT_IMAGES.skinnyJeans],
    price: 210,
    originalPrice: null,
    discount: null,
    rating: createRating(4.5, 567),
    category: 'casual',
    subcategory: 'Jeans',
    colors: ['#000000', '#4169E1'],
    sizes: ['28', '30', '32', '34', '36'],
    stock: 100,
    isTopSelling: true
  },
  {
    id: 'ts-5',
    name: 'Classic Polo Shirt',
    image: PRODUCT_IMAGES.poloShirt,
    images: [PRODUCT_IMAGES.poloShirt],
    price: 165,
    originalPrice: 190,
    discount: 13,
    rating: createRating(4.6, 892),
    category: 'casual',
    subcategory: 'Shirts',
    colors: ['#000080', '#FFFFFF', '#DC143C'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 100,
    isTopSelling: true
  },
  {
    id: 'ts-6',
    name: 'Graphic Print Tee',
    image: PRODUCT_IMAGES.graphicTee,
    images: [PRODUCT_IMAGES.graphicTee],
    price: 110,
    originalPrice: 140,
    discount: 21,
    rating: createRating(4.4, 678),
    category: 'casual',
    subcategory: 'T-shirts',
    colors: ['#000000', '#FFFFFF', '#808080'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 100,
    isTopSelling: true
  },
  {
    id: 'ts-7',
    name: 'Premium Hoodie',
    image: PRODUCT_IMAGES.hoodie,
    images: [PRODUCT_IMAGES.hoodie],
    price: 295,
    originalPrice: 350,
    discount: 16,
    rating: createRating(4.8, 1234),
    category: 'casual',
    subcategory: 'Hoodies',
    colors: ['#000000', '#808080', '#000080'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 100,
    isTopSelling: true
  },
  {
    id: 'ts-8',
    name: 'Casual Button Shirt',
    image: PRODUCT_IMAGES.casualShirt,
    images: [PRODUCT_IMAGES.casualShirt],
    price: 175,
    originalPrice: null,
    discount: null,
    rating: createRating(4.3, 445),
    category: 'casual',
    subcategory: 'Shirts',
    colors: ['#4169E1', '#FFFFFF', '#000000'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100,
    isTopSelling: true
  }
]

// Men's Clothing Products
export const MENS_PRODUCTS = [
  {
    id: 'men-1',
    name: 'Classic Denim Jacket',
    image: mensImg1,
    price: 299,
    originalPrice: 350,
    discount: 15,
    rating: createRating(4.5, 234),
    category: 'men',
    subcategory: 'Jackets',
    colors: ['#1E3A8A', '#000000'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100
  },
  {
    id: 'men-2',
    name: 'Premium Cotton Shirt',
    image: mensImg2,
    price: 180,
    originalPrice: 220,
    discount: 18,
    rating: createRating(4.0, 189),
    category: 'men',
    subcategory: 'Shirts',
    colors: ['#FFFFFF', '#87CEEB', '#FFC0CB'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 100
  },
  {
    id: 'men-3',
    name: 'Casual Green Shirt',
    image: mensImg3,
    price: 210,
    originalPrice: null,
    discount: null,
    rating: createRating(5.0, 567),
    category: 'men',
    subcategory: 'Shirts',
    colors: ['#228B22', '#000000', '#FFFFFF'],
    sizes: ['M', 'L', 'XL'],
    stock: 100
  },
  {
    id: 'men-4',
    name: 'Street Style Outfit',
    image: mensImg4,
    price: 425,
    originalPrice: 500,
    discount: 15,
    rating: createRating(4.5, 892),
    category: 'men',
    subcategory: 'Outfits',
    colors: ['#8B4513', '#FFFFFF'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100
  },
  {
    id: 'men-5',
    name: 'Urban Casual Shirt',
    image: PRODUCT_IMAGES.checkeredShirt,
    price: 165,
    originalPrice: 200,
    discount: 17,
    rating: createRating(4.4, 321),
    category: 'men',
    subcategory: 'Shirts',
    colors: ['#0000FF', '#FF0000', '#008000'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 100
  },
  {
    id: 'men-6',
    name: 'Slim Fit Denim',
    image: PRODUCT_IMAGES.skinnyJeans,
    price: 255,
    originalPrice: 300,
    discount: 15,
    rating: createRating(4.6, 543),
    category: 'men',
    subcategory: 'Jeans',
    colors: ['#4169E1', '#000000', '#808080'],
    sizes: ['28', '30', '32', '34', '36', '38'],
    stock: 100
  },
  {
    id: 'men-7',
    name: 'Athletic T-Shirt',
    image: PRODUCT_IMAGES.blackTshirt,
    price: 125,
    originalPrice: null,
    discount: null,
    rating: createRating(4.3, 412),
    category: 'men',
    subcategory: 'T-shirts',
    colors: ['#000000', '#FFFFFF', '#808080', '#000080'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 100
  },
  {
    id: 'men-8',
    name: 'Striped Casual Tee',
    image: PRODUCT_IMAGES.stripedTshirt,
    price: 135,
    originalPrice: 170,
    discount: 20,
    rating: createRating(4.5, 389),
    category: 'men',
    subcategory: 'T-shirts',
    colors: ['#FFA500', '#000000', '#FFFFFF'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100
  }
]

// Women's Clothing Products
export const WOMENS_PRODUCTS = [
  {
    id: 'women-1',
    name: 'Elegant Summer Dress',
    image: womensImg1,
    price: 350,
    originalPrice: 420,
    discount: 17,
    rating: createRating(4.8, 456),
    category: 'women',
    subcategory: 'Dresses',
    colors: ['#FF69B4', '#FFFFFF', '#000000'],
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 100
  },
  {
    id: 'women-2',
    name: 'Power Suit Outfit',
    image: womensImg2,
    price: 520,
    originalPrice: 650,
    discount: 20,
    rating: createRating(5.0, 678),
    category: 'women',
    subcategory: 'Suits',
    colors: ['#A9A9A9', '#000000'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100
  },
  {
    id: 'women-3',
    name: 'Outdoor Party Jacket',
    image: womensImg3,
    price: 380,
    originalPrice: 450,
    discount: 16,
    rating: createRating(4.5, 345),
    category: 'women',
    subcategory: 'Jackets',
    colors: ['#D2B48C', '#8B4513', '#000000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 100
  },
  {
    id: 'women-4',
    name: 'Vintage Style Top',
    image: womensImg4,
    price: 195,
    originalPrice: 240,
    discount: 19,
    rating: createRating(4.2, 234),
    category: 'women',
    subcategory: 'Tops',
    colors: ['#FFE4E1', '#FFFFFF', '#C0C0C0'],
    sizes: ['S', 'M', 'L'],
    stock: 100
  },
  {
    id: 'women-5',
    name: 'Chic Casual Blouse',
    image: PRODUCT_IMAGES.checkeredShirt,
    price: 175,
    originalPrice: 220,
    discount: 20,
    rating: createRating(4.4, 298),
    category: 'women',
    subcategory: 'Tops',
    colors: ['#FF69B4', '#FFFFFF', '#000080'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 100
  },
  {
    id: 'women-6',
    name: 'Skinny Fit Jeans',
    image: PRODUCT_IMAGES.skinnyJeans,
    price: 265,
    originalPrice: 310,
    discount: 15,
    rating: createRating(4.7, 512),
    category: 'women',
    subcategory: 'Jeans',
    colors: ['#4169E1', '#000000', '#696969'],
    sizes: ['24', '26', '28', '30', '32'],
    stock: 100
  },
  {
    id: 'women-7',
    name: 'Trendy Graphic Tee',
    image: PRODUCT_IMAGES.graphicTee,
    price: 140,
    originalPrice: null,
    discount: null,
    rating: createRating(4.3, 367),
    category: 'women',
    subcategory: 'T-shirts',
    colors: ['#000000', '#FFFFFF', '#FF1493'],
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 100
  },
  {
    id: 'women-8',
    name: 'Cozy Hoodie',
    image: PRODUCT_IMAGES.hoodie,
    price: 310,
    originalPrice: 360,
    discount: 14,
    rating: createRating(4.8, 621),
    category: 'women',
    subcategory: 'Hoodies',
    colors: ['#FFB6C1', '#808080', '#000000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 100
  }
]

// Accessories Products
export const ACCESSORIES_PRODUCTS = [
  {
    id: 'acc-1',
    name: 'Designer Handbag',
    image: accessoriesImg1,
    price: 450,
    originalPrice: 550,
    discount: 18,
    rating: createRating(4.7, 567),
    category: 'accessories',
    subcategory: 'Bags',
    colors: ['#8B4513', '#000000', '#A0522D'],
    sizes: ['One Size'],
    stock: 100
  },
  {
    id: 'acc-2',
    name: 'Luxury Watch',
    image: accessoriesImg2,
    price: 850,
    originalPrice: 1000,
    discount: 15,
    rating: createRating(5.0, 892),
    category: 'accessories',
    subcategory: 'Watches',
    colors: ['#FFD700', '#C0C0C0', '#000000'],
    sizes: ['One Size'],
    stock: 100
  },
  {
    id: 'acc-3',
    name: 'Leather Belt',
    image: accessoriesImg3,
    price: 120,
    originalPrice: 150,
    discount: 20,
    rating: createRating(4.3, 234),
    category: 'accessories',
    subcategory: 'Belts',
    colors: ['#8B4513', '#000000'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100
  },
  {
    id: 'acc-4',
    name: 'Stylish Sunglasses',
    image: accessoriesImg4,
    price: 180,
    originalPrice: 220,
    discount: 18,
    rating: createRating(4.6, 456),
    category: 'accessories',
    subcategory: 'Sunglasses',
    colors: ['#000000', '#8B4513', '#FFD700'],
    sizes: ['One Size'],
    stock: 100
  },
  {
    id: 'acc-5',
    name: 'Premium Leather Wallet',
    image: accessoriesImg1,
    price: 95,
    originalPrice: 120,
    discount: 21,
    rating: createRating(4.5, 389),
    category: 'accessories',
    subcategory: 'Wallets',
    colors: ['#8B4513', '#000000', '#A0522D'],
    sizes: ['One Size'],
    stock: 100
  },
  {
    id: 'acc-6',
    name: 'Sport Watch',
    image: accessoriesImg2,
    price: 650,
    originalPrice: 800,
    discount: 19,
    rating: createRating(4.8, 712),
    category: 'accessories',
    subcategory: 'Watches',
    colors: ['#000000', '#C0C0C0', '#0000FF'],
    sizes: ['One Size'],
    stock: 100
  },
  {
    id: 'acc-7',
    name: 'Designer Backpack',
    image: accessoriesImg3,
    price: 380,
    originalPrice: 450,
    discount: 16,
    rating: createRating(4.6, 523),
    category: 'accessories',
    subcategory: 'Bags',
    colors: ['#000000', '#808080', '#8B4513'],
    sizes: ['One Size'],
    stock: 100
  },
  {
    id: 'acc-8',
    name: 'Aviator Sunglasses',
    image: accessoriesImg4,
    price: 210,
    originalPrice: 260,
    discount: 19,
    rating: createRating(4.7, 445),
    category: 'accessories',
    subcategory: 'Sunglasses',
    colors: ['#FFD700', '#C0C0C0', '#000000'],
    sizes: ['One Size'],
    stock: 100
  }
]

// Footwear Products
export const FOOTWEAR_PRODUCTS = [
  {
    id: 'foot-1',
    name: 'Classic Sneakers',
    image: footwearImg1,
    price: 320,
    originalPrice: 400,
    discount: 20,
    rating: createRating(4.8, 678),
    category: 'footwear',
    subcategory: 'Sneakers',
    colors: ['#FFFFFF', '#000000', '#FF0000'],
    sizes: ['7', '8', '9', '10', '11'],
    stock: 100
  },
  {
    id: 'foot-2',
    name: 'Formal Leather Shoes',
    image: footwearImg2,
    price: 450,
    originalPrice: 550,
    discount: 18,
    rating: createRating(4.5, 345),
    category: 'footwear',
    subcategory: 'Formal',
    colors: ['#000000', '#8B4513'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 100
  },
  {
    id: 'foot-3',
    name: 'Running Sports Shoes',
    image: footwearImg3,
    price: 280,
    originalPrice: 350,
    discount: 20,
    rating: createRating(4.7, 892),
    category: 'footwear',
    subcategory: 'Sports',
    colors: ['#1E90FF', '#000000', '#FFFFFF'],
    sizes: ['7', '8', '9', '10', '11'],
    stock: 100
  },
  {
    id: 'foot-4',
    name: 'Casual Loafers',
    image: footwearImg4,
    price: 250,
    originalPrice: 300,
    discount: 17,
    rating: createRating(4.4, 234),
    category: 'footwear',
    subcategory: 'Casual',
    colors: ['#8B4513', '#000000', '#D2691E'],
    sizes: ['7', '8', '9', '10', '11'],
    stock: 100
  },
  {
    id: 'foot-5',
    name: 'High-Top Canvas Shoes',
    image: footwearImg1,
    price: 195,
    originalPrice: 240,
    discount: 19,
    rating: createRating(4.3, 412),
    category: 'footwear',
    subcategory: 'Sneakers',
    colors: ['#FFFFFF', '#FF0000', '#000080'],
    sizes: ['6', '7', '8', '9', '10', '11'],
    stock: 100
  },
  {
    id: 'foot-6',
    name: 'Premium Boots',
    image: footwearImg2,
    price: 520,
    originalPrice: 650,
    discount: 20,
    rating: createRating(4.9, 567),
    category: 'footwear',
    subcategory: 'Boots',
    colors: ['#8B4513', '#000000'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 100
  },
  {
    id: 'foot-7',
    name: 'Trail Running Shoes',
    image: footwearImg3,
    price: 310,
    originalPrice: 380,
    discount: 18,
    rating: createRating(4.6, 723),
    category: 'footwear',
    subcategory: 'Sports',
    colors: ['#000000', '#FFA500', '#FFFFFF'],
    sizes: ['7', '8', '9', '10', '11'],
    stock: 100
  },
  {
    id: 'foot-8',
    name: 'Slip-On Casual Shoes',
    image: footwearImg4,
    price: 220,
    originalPrice: 270,
    discount: 19,
    rating: createRating(4.5, 334),
    category: 'footwear',
    subcategory: 'Casual',
    colors: ['#696969', '#000000', '#FFFFFF'],
    sizes: ['7', '8', '9', '10', '11'],
    stock: 100
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
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      stock: 100
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
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 100
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
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      stock: 100
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
      sizes: ['28', '30', '32', '34', '36'],
      stock: 100
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
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 100
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
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 100
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
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 100
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
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      stock: 100
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
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 100
    }
  ],
  men: MENS_PRODUCTS,
  women: WOMENS_PRODUCTS,
  accessories: ACCESSORIES_PRODUCTS,
  footwear: FOOTWEAR_PRODUCTS
}

// Filter options for category pages
export const FILTER_OPTIONS = {
  categories: [
    { id: 'men', name: 'Men', count: 4 },
    { id: 'women', name: 'Women', count: 4 },
    { id: 'accessories', name: 'Accessories', count: 3 },
    { id: 'footwear', name: 'Footwear', count: 2 }
  ],
  subcategories: [
    { id: 't-shirts', name: 'T-shirts', count: 4 },
    { id: 'shirts', name: 'Shirts', count: 3 },
    { id: 'jeans', name: 'Jeans', count: 2 },
    { id: 'jackets', name: 'Jackets', count: 1 },
    { id: 'shorts', name: 'Shorts', count: 1 },
    { id: 'hoodies', name: 'Hoodies', count: 0 }
  ],
  priceRanges: [
    { min: 50, max: 100, label: '₹50 - ₹100' },
    { min: 100, max: 200, label: '₹100 - ₹200' },
    { min: 200, max: 300, label: '₹200 - ₹300' }
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
  'Men',
  'Women', 
  'Accessories',
  'Footwear'
]

// Product subcategories
export const SUBCATEGORIES = [
  'T-shirts',
  'Shirts',
  'Jeans',
  'Jackets',
  'Shorts',
  'Hoodies'
]