import { useState, useRef } from 'react'

/**
 * ImageZoom Component - Flipkart-style image zoom on hover
 * Shows a magnified portion of the image in a separate lens container
 */
export default function ImageZoom({ src, alt = '', className = '' }) {
  const [showZoom, setShowZoom] = useState(false)
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 })
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)
  const containerRef = useRef(null)

  const LENS_SIZE = 150 // Size of the lens box
  const ZOOM_LEVEL = 2.5 // Zoom magnification

  const handleMouseMove = (e) => {
    if (!containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    
    // Calculate mouse position relative to the image container
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top

    // Calculate lens position (centered on cursor)
    let lensX = x - LENS_SIZE / 2
    let lensY = y - LENS_SIZE / 2

    // Boundary checks - keep lens within image
    if (lensX < 0) lensX = 0
    if (lensY < 0) lensY = 0
    if (lensX > rect.width - LENS_SIZE) lensX = rect.width - LENS_SIZE
    if (lensY > rect.height - LENS_SIZE) lensY = rect.height - LENS_SIZE

    // Calculate the zoom background position
    // The zoomed area should show the same region the lens is covering
    const bgX = (lensX / (rect.width - LENS_SIZE)) * 100
    const bgY = (lensY / (rect.height - LENS_SIZE)) * 100

    setLensPosition({ x: lensX, y: lensY })
    setZoomPosition({ x: bgX, y: bgY })
  }

  const handleMouseEnter = () => {
    setShowZoom(true)
  }

  const handleMouseLeave = () => {
    setShowZoom(false)
  }

  return (
    <div className="relative">
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className={`aspect-square bg-gray-50 rounded-3xl overflow-hidden shadow-sm relative border border-gray-100 cursor-crosshair ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="w-full h-full object-cover select-none pointer-events-none"
          draggable="false"
        />

        {/* Hover Lens Overlay */}
        {showZoom && (
          <div
            className="absolute border-2 border-gray-400 shadow-lg pointer-events-none bg-white/30 backdrop-blur-sm"
            style={{
              width: `${LENS_SIZE}px`,
              height: `${LENS_SIZE}px`,
              left: `${lensPosition.x}px`,
              top: `${lensPosition.y}px`,
            }}
          />
        )}
      </div>

      {/* Zoomed Image Container - Overlays the right side content */}
      {showZoom && (
        <>
          {/* Desktop: Fixed position overlay to the right */}
          <div 
            className="hidden lg:block fixed w-[500px] h-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 z-[9999]"
            style={{
              top: '20%',
              left: '55%',
            }}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: `${ZOOM_LEVEL * 100}%`,
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
