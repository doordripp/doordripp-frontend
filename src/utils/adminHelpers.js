// Admin Helper Functions
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
};

export const formatCurrency = (amount) => {
  // Accept numbers or strings like "$1,234.56" and return INR formatted string
  if (amount === null || amount === undefined) return ''

  let value = amount
  if (typeof value === 'string') {
    // strip non-numeric except dot and minus
    const cleaned = value.replace(/[^0-9.-]+/g, '')
    value = parseFloat(cleaned)
  }
  if (isNaN(value)) return ''

  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value)
};

export const generateId = () => {
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
};