import { useLocation } from 'react-router-dom'

/**
 * Returns the base path of the current panel ('/admin', '/manager', or '/delivery').
 * Used by shared pages to generate correct relative links regardless of which panel they're rendered in.
 */
export function usePanelBase() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/manager')) return '/manager'
  if (pathname.startsWith('/delivery')) return '/delivery'
  return '/admin'
}
