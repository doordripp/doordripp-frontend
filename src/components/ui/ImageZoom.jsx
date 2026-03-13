import { useState, useRef } from 'react'

/**
 * ImageZoom Component - In-box smooth zoom on hover
 * When user hovers, image zooms inside the same container following the cursor
 */
export default function ImageZoom({ src, alt = '', className = '' }) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const containerRef = useRef(null)

  const ZOOM_LEVEL = 1.8

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({ x, y })
  }

  return (
    <div
      ref={containerRef}
      className={`aspect-square bg-gray-50 rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-zoom-in ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover select-none pointer-events-none"
        draggable="false"
        style={{
          transform: isZoomed ? `scale(${ZOOM_LEVEL})` : 'scale(1)',
          transformOrigin: `${origin.x}% ${origin.y}%`,
          transition: isZoomed
            ? 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), transform-origin 0.15s ease'
            : 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      />
    </div>
  )
}
