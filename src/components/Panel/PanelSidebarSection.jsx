import React from 'react'

export default function PanelSidebarSection({ title, children }) {
  return (
    <div className="mt-4">
      {title && (
        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}
