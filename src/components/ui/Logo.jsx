import React from 'react'
import logoImage from '../../assets/logo.jpg'

export default function Logo({ className = "", size = 40 }) {
  return (
    <img 
      src={logoImage} 
      alt="DoorDripp Logo" 
      style={{ height: `${size}px`, width: 'auto' }}
      className={className}
    />
  )
}
