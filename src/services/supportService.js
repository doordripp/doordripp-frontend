import api from './api'

export async function fetchSupportFaqs(language = 'en') {
  const response = await api.get('/support/faqs', { params: { lang: language } })
  return response.data
}

export async function sendSupportMessage(message, language = 'en', questionId) {
  const response = await api.post('/support/chat', { message, language, questionId })
  return response.data
}

export async function createSupportTicket(payload) {
  const response = await api.post('/support/tickets', payload)
  return response.data
}
