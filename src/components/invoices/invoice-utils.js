/**
 * Invoice Utility Functions
 * Helper functions for invoice generation, calculations, and data transformation
 */

// ============================================
// Invoice Number Generation
// ============================================

/**
 * Generate sequential invoice number
 * Format: INV-YYYY-00001
 */
export const generateInvoiceNumber = (lastInvoiceNumber = null) => {
  const year = new Date().getFullYear()
  
  if (!lastInvoiceNumber) {
    return `INV-${year}-00001`
  }
  
  const match = lastInvoiceNumber.match(/INV-(\d{4})-(\d{5})/)
  if (!match) return `INV-${year}-00001`
  
  const [, prevYear, prevNum] = match
  
  if (parseInt(prevYear) !== year) {
    return `INV-${year}-00001`
  }
  
  const nextNum = String(parseInt(prevNum) + 1).padStart(5, '0')
  return `INV-${year}-${nextNum}`
}

// ============================================
// GST Calculations
// ============================================

/**
 * Calculate GST amount (CGST + SGST for intra-state)
 */
export const calculateGST = (amount, gstRate = 5) => {
  const gstAmount = (amount * gstRate) / 100
  const cgst = gstAmount / 2
  const sgst = gstAmount / 2
  
  return {
    gstAmount: Math.round(gstAmount * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100
  }
}

/**
 * Calculate IGST (for inter-state transactions)
 */
export const calculateIGST = (amount, gstRate = 5) => {
  const igst = (amount * gstRate) / 100
  
  return {
    igstAmount: Math.round(igst * 100) / 100
  }
}

/**
 * Calculate item total with GST
 */
export const calculateItemTotal = (quantity, unitPrice, gstRate = 5) => {
  const taxableAmount = quantity * unitPrice
  const { cgst, sgst } = calculateGST(taxableAmount, gstRate)
  const totalAmount = taxableAmount + cgst + sgst
  
  return {
    quantity,
    unitPrice: Math.round(unitPrice * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    gstRate,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100
  }
}

// ============================================
// Invoice Summary Calculations
// ============================================

/**
 * Calculate invoice totals from items array
 */
export const calculateInvoiceTotals = (items = []) => {
  const subtotal = items.reduce((sum, item) => sum + item.taxableAmount, 0)
  const totalCGST = items.reduce((sum, item) => sum + (item.cgst || 0), 0)
  const totalSGST = items.reduce((sum, item) => sum + (item.sgst || 0), 0)
  const totalGST = totalCGST + totalSGST
  const grandTotal = subtotal + totalGST
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalCGST: Math.round(totalCGST * 100) / 100,
    totalSGST: Math.round(totalSGST * 100) / 100,
    totalGST: Math.round(totalGST * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100
  }
}

// ============================================
// Amount to Words Conversion (Indian Format)
// ============================================

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

/**
 * Convert amount to words in Indian rupees format
 * Example: 1234567 → "Twelve Lakh Thirty Four Thousand Five Hundred Sixty Seven Rupees Only"
 */
export const amountToWords = (amount) => {
  if (amount === 0) return 'Zero Rupees Only'
  
  const num = Math.floor(amount)
  const decimals = Math.round((amount - num) * 100)
  
  const numStr = num.toString().padStart(9, '0')
  let result = ''
  
  const crore = parseInt(numStr.substring(0, 1))
  const lakh = parseInt(numStr.substring(1, 3))
  const thousand = parseInt(numStr.substring(3, 5))
  const hundred = parseInt(numStr.substring(5, 7))
  const onesValue = parseInt(numStr.substring(7, 9))
  
  if (crore > 0) {
    result += convertToWords(crore) + ' Crore '
  }
  
  if (lakh > 0) {
    result += convertToWords(lakh) + ' Lakh '
  }
  
  if (thousand > 0) {
    result += convertToWords(thousand) + ' Thousand '
  }
  
  if (hundred > 0) {
    result += ones[hundred] + ' Hundred '
  }
  
  if (onesValue > 0) {
    result += convertToWords(onesValue) + ' '
  }
  
  result = result.trim() + ' Rupees'
  
  if (decimals > 0) {
    result += ` and ${convertToWords(decimals)} Paise`
  }
  
  return result + ' Only'
}

/**
 * Helper to convert 0-99 to words
 */
function convertToWords(num) {
  if (num === 0) return ''
  if (num < 10) return ones[num]
  if (num < 20) return teens[num - 10]
  
  const ten = Math.floor(num / 10)
  const one = num % 10
  
  if (one === 0) return tens[ten]
  return tens[ten] + ' ' + ones[one]
}

// ============================================
// Data Transformation
// ============================================

/**
 * Transform order from API to invoice format
 */
export const transformOrderToInvoice = (order) => {
  if (!order) return null

  const shipping = order.shippingAddress || {}
  const billing = order.billingAddress || shipping || {}

  return {
    invoiceNumber: generateInvoiceNumber(order.invoiceNumber),
    invoiceDate: new Date(order.createdAt).toLocaleDateString('en-IN'),
    orderId: order._id,
    poDate: new Date(order.createdAt).toLocaleDateString('en-IN'),
    
    customerName: order.customer?.name || order.customerName || 'N/A',
    customerEmail: order.customer?.email || order.customerEmail || 'N/A',
    customerPhone: order.customer?.phone || order.customerPhone || 'N/A',
    
    billingAddress: {
      street: billing.street || billing.line1 || '',
      city: billing.city || '',
      state: billing.state || '',
      pincode: billing.pincode || billing.zip || '',
      country: billing.country || 'India',
      stateCode: getStateCode(billing.state) || '29'
    },

    shippingAddress: {
      street: shipping.street || shipping.line1 || '',
      city: shipping.city || '',
      state: shipping.state || '',
      pincode: shipping.pincode || shipping.zip || '',
      country: shipping.country || 'India'
    },
    
    items: (order.items || []).map((item, idx) => {
      const gstRate = item.gstRate || 5
      const taxableAmount = (item.price || 0) * (item.quantity || 0)
      const cgst = item.cgst != null ? item.cgst : calculateGST(taxableAmount, gstRate).cgst
      const sgst = item.sgst != null ? item.sgst : calculateGST(taxableAmount, gstRate).sgst
      const totalAmount = item.itemTotal != null ? item.itemTotal : taxableAmount + cgst + sgst

      return {
        sno: idx + 1,
        name: item.name,
        description: item.description || item.product?.description || '',
        hsnCode: item.hsnCode || item.hsnSac || item.product?.hsnSac || '6104',
        quantity: item.quantity,
        unitPrice: item.price,
        taxableAmount,
        gstPercent: gstRate,
        cgst,
        sgst,
        totalAmount
      }
    }),

    isTrial: Boolean(order.isTrial),
    trialFee: Number(order.trialFee || 0),
    deliveryFee: Number(order.deliveryFee || 0),
    deliveryType: order.deliveryType || 'Standard',
    voucherCode: order.voucher?.code || order.voucherCode || '',
    voucherDiscount: Number(order.voucherDiscount || order.voucher?.discountAmount || 0),
    totalBeforeDiscount: Number(order.totalBeforeDiscount || ((order.subtotal || 0) + (order.trialFee || 0) + (order.deliveryFee || 0))),
    total: order.total != null ? Number(order.total) : null,

    paymentMode: order.payment?.method || order.paymentMode || 'Not Specified',
    transactionId: order.payment?.transactionId || order.transactionId || 'N/A',
    paymentStatus: order.payment?.status || order.paymentStatus || 'Pending'
  }
}

/**
 * Transform backend invoice + items into InvoiceTemplate format
 */
export const transformInvoiceApiToTemplate = (invoice, items = [], order = null) => {
  if (!invoice) return null

  const buyer = invoice.buyerAddress || {}
  const shipping = order?.shippingAddress || buyer || {}
  const deliveryFee = Number(order?.deliveryFee ?? invoice.deliveryFee ?? 0)
  const trialFee = Number(order?.trialFee ?? invoice.trialFee ?? 0)
  const voucherCode = order?.voucher?.code || invoice.voucherCode || invoice.voucher?.code || ''
  const voucherDiscount = Number(order?.voucherDiscount ?? order?.voucher?.discountAmount ?? invoice.voucherDiscount ?? invoice.discountAmount ?? 0)
  const totalBeforeDiscount = Number(order?.totalBeforeDiscount ?? invoice.totalBeforeDiscount ?? ((order?.subtotal || 0) + trialFee + deliveryFee))
  const total = order?.total != null ? Number(order.total) : (invoice.totalAmount != null ? Number(invoice.totalAmount) : null)

  return {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('en-IN'),
    orderId: invoice.orderId,
    poDate: new Date(invoice.invoiceDate).toLocaleDateString('en-IN'),

    customerName: invoice.buyerName || order?.customer?.name || order?.customerName || 'N/A',
    customerEmail: invoice.buyerEmail || order?.customer?.email || order?.customerEmail || 'N/A',
    customerPhone: invoice.buyerPhone || order?.customer?.phone || order?.customerPhone || 'N/A',

    billingAddress: {
      street: buyer.line1 || buyer.line2 || buyer.street || '',
      city: buyer.city || '',
      state: buyer.state || '',
      pincode: buyer.pincode || '',
      country: buyer.country || 'India',
      stateCode: invoice.buyerStateCode || getStateCode(buyer.state) || '29'
    },

    shippingAddress: {
      street: shipping.street || shipping.line1 || '',
      city: shipping.city || '',
      state: shipping.state || '',
      pincode: shipping.pincode || shipping.zip || '',
      country: shipping.country || 'India'
    },

    items: (items || []).map((item, idx) => ({
      sno: item.serialNumber || idx + 1,
      name: item.productName,
      description: item.productDescription || '',
      hsnCode: item.hsnSac || '6104',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxableAmount: item.taxableValue,
      gstPercent: item.gstRate,
      cgst: item.cgst || 0,
      sgst: item.sgst || 0,
      totalAmount: item.totalPrice
    })),

    isTrial: Boolean(order?.isTrial),
    trialFee,
    deliveryFee,
    deliveryType: order?.deliveryType || invoice.deliveryType || 'Standard',
    voucherCode,
    voucherDiscount,
    totalBeforeDiscount,
    total,

    paymentMode: invoice.paymentMode || 'Not Specified',
    transactionId: order?.payment?.transactionId || 'N/A',
    paymentStatus: invoice.paymentStatus || 'Pending'
  }
}

// ============================================
// GST State Codes (India)
// ============================================

const STATE_CODES = {
  'Andhra Pradesh': '37',
  'Arunachal Pradesh': '12',
  'Assam': '18',
  'Bihar': '10',
  'Chhattisgarh': '22',
  'Dadra and Nagar Haveli': '26',
  'Daman and Diu': '25',
  'Delhi': '07',
  'Goa': '30',
  'Gujarat': '24',
  'Haryana': '06',
  'Himachal Pradesh': '02',
  'Jharkhand': '20',
  'Karnataka': '29',
  'Kerala': '32',
  'Ladakh': '37',
  'Lakshadweep': '31',
  'Madhya Pradesh': '23',
  'Maharashtra': '27',
  'Manipur': '14',
  'Meghalaya': '17',
  'Mizoram': '15',
  'Nagaland': '13',
  'Odisha': '21',
  'Puducherry': '34',
  'Punjab': '03',
  'Rajasthan': '08',
  'Sikkim': '11',
  'Tamil Nadu': '33',
  'Telangana': '36',
  'Tripura': '16',
  'Uttar Pradesh': '09',
  'Uttarakhand': '05',
  'West Bengal': '19'
}

/**
 * Get GST state code for a state name
 */
export const getStateCode = (stateName) => {
  return STATE_CODES[stateName] || '29'
}

/**
 * Get state name from GST code
 */
export const getStateName = (stateCode) => {
  const entry = Object.entries(STATE_CODES).find(([, code]) => code === stateCode)
  return entry ? entry[0] : 'Unknown'
}

// ============================================
// HSN Codes for Products
// ============================================

const HSN_CODES = {
  'tshirt': { code: '6104', rate: 5, description: 'T-Shirts' },
  'shirt': { code: '6105', rate: 5, description: 'Shirts' },
  'jeans': { code: '6203', rate: 5, description: 'Jeans/Trousers' },
  'shorts': { code: '6205', rate: 5, description: 'Shorts' },
  'jacket': { code: '6202', rate: 5, description: 'Jackets' },
  'dress': { code: '6204', rate: 5, description: 'Dresses' },
  'underwear': { code: '6108', rate: 5, description: 'Undergarments' },
  'socks': { code: '6115', rate: 5, description: 'Socks' },
  'cap': { code: '6506', rate: 5, description: 'Caps/Hats' }
}

/**
 * Get HSN code and GST rate for product category
 */
export const getHSNCode = (category) => {
  const key = category.toLowerCase().replace(/\s+/g, '')
  return HSN_CODES[key] || HSN_CODES['tshirt']
}

// ============================================
// Validation Functions
// ============================================

/**
 * Validate GSTIN format
 */
export const validateGSTIN = (gstin) => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstinRegex.test(gstin)
}

/**
 * Validate PAN format
 */
export const validatePAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  return panRegex.test(pan)
}

/**
 * Validate invoice data completeness
 */
export const validateInvoiceData = (data) => {
  const errors = []
  
  if (!data.invoiceNumber) errors.push('Invoice number is required')
  if (!data.customerName) errors.push('Customer name is required')
  if (!data.items || data.items.length === 0) errors.push('At least one item is required')
  
  if (data.items) {
    data.items.forEach((item, idx) => {
      if (!item.name) errors.push(`Item ${idx + 1}: Name is required`)
      if (!item.quantity || item.quantity <= 0) errors.push(`Item ${idx + 1}: Valid quantity is required`)
      if (!item.unitPrice || item.unitPrice <= 0) errors.push(`Item ${idx + 1}: Valid price is required`)
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// ============================================
// Export Functions
// ============================================

/**
 * Generate invoice as JSON (for API storage)
 */
export const generateInvoiceJSON = (invoiceData) => {
  return {
    ...invoiceData,
    totals: calculateInvoiceTotals(invoiceData.items),
    generatedAt: new Date().toISOString()
  }
}

/**
 * Generate invoice as CSV (for backup/export)
 */
export const generateInvoiceCSV = (invoiceData) => {
  let csv = 'Invoice Report\n'
  csv += `Invoice #,${invoiceData.invoiceNumber}\n`
  csv += `Date,${invoiceData.invoiceDate}\n`
  csv += `Customer,${invoiceData.customerName}\n\n`
  
  csv += 'Item,HSN,Qty,Unit Price,Taxable,CGST,SGST,Total\n'
  invoiceData.items.forEach(item => {
    csv += `"${item.name}",${item.hsnCode},${item.quantity},${item.unitPrice},${item.taxableAmount},${item.cgst},${item.sgst},${item.totalAmount}\n`
  })
  
  const totals = calculateInvoiceTotals(invoiceData.items)
  csv += `\nSubtotal,,,,${totals.subtotal}\n`
  csv += `CGST,,,,${totals.totalCGST}\n`
  csv += `SGST,,,,${totals.totalSGST}\n`
  csv += `Grand Total,,,,${totals.grandTotal}\n`
  
  return csv
}

// ============================================
// Export all utilities
// ============================================

export default {
  generateInvoiceNumber,
  calculateGST,
  calculateIGST,
  calculateItemTotal,
  calculateInvoiceTotals,
  amountToWords,
  transformOrderToInvoice,
  transformInvoiceApiToTemplate,
  getStateCode,
  getStateName,
  getHSNCode,
  validateGSTIN,
  validatePAN,
  validateInvoiceData,
  generateInvoiceJSON,
  generateInvoiceCSV
}
