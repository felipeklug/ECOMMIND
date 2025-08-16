'use client'

import { LucideIcon } from 'lucide-react'

interface MosaicCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: LucideIcon
  description?: string
  onClick?: () => void
  className?: string
}

export function MosaicCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  description,
  onClick,
  className = ''
}: MosaicCardProps) {
  return (
    <div 
      className={`
        card-mosaic p-6 cursor-pointer hover:shadow-lg transition-all duration-200
        ${onClick ? 'hover:scale-[1.02]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-brand-light rounded-lg">
              <Icon className="w-5 h-5 text-brand-500" />
            </div>
          )}
          <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        </div>
        
        {change && (
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            ${changeType === 'positive' 
              ? 'bg-success-light text-success' 
              : changeType === 'negative'
              ? 'bg-danger-light text-danger'
              : 'bg-info-light text-info'
            }
          `}>
            {change}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <div className="text-2xl font-bold text-text">{value}</div>
        {description && (
          <p className="text-sm text-muted mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}
