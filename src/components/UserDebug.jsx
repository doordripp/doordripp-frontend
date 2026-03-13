import { useAuth } from '../context/AuthContext'
import { hasAdminAccess } from '../utils/roleUtils'

export default function UserDebug() {
  const { user } = useAuth()
  
  if (!user) return null
  
  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'black',
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      borderRadius: '5px'
    }}>
      <div>User: {user.email}</div>
      <div>Roles: {JSON.stringify(user.roles)}</div>
      <div>Has Admin: {hasAdminAccess(user) ? 'YES' : 'NO'}</div>
    </div>
  )
}