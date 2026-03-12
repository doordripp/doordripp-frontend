const ORDER_ID_LENGTH = 8

export const getOrderEntityId = (orderOrId) => {
  if (!orderOrId) return ''
  if (typeof orderOrId === 'object') {
    return String(orderOrId._id || orderOrId.id || orderOrId.orderId || orderOrId.orderNumber || orderOrId.orderNo || '')
  }
  return String(orderOrId)
}

export const getOrderDisplayId = (orderOrId, { prefix = true } = {}) => {
  const rawId = getOrderEntityId(orderOrId)
  if (!rawId) return ''

  const normalizedId = rawId.replace(/^#/, '').trim()
  const shortId =
    normalizedId.length > ORDER_ID_LENGTH
      ? normalizedId.slice(-ORDER_ID_LENGTH)
      : normalizedId

  return `${prefix ? '#' : ''}${shortId.toUpperCase()}`
}

export const matchesOrderIdQuery = (orderOrId, query = '') => {
  const normalizedQuery = String(query || '').trim().toLowerCase()
  if (!normalizedQuery) return true

  const rawId = getOrderEntityId(orderOrId).toLowerCase()
  const displayId = getOrderDisplayId(orderOrId).toLowerCase()
  const compactDisplayId = displayId.replace('#', '')

  return (
    rawId.includes(normalizedQuery) ||
    displayId.includes(normalizedQuery) ||
    compactDisplayId.includes(normalizedQuery)
  )
}
