'use client'

import { LucideIcon } from 'lucide-react'
import { useState } from 'react'

interface MetricCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  period: string
  onClick?: () => void
  isLoading?: boolean
}

export function MetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  period,
  onClick,
  isLoading = false
}: MetricCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-success'
      case 'negative':
        return 'text-error'
      default:
        return 'text-text-secondary'
    }
  }

  const getChangeIcon = () => {
    if (changeType === 'positive') return '↗'
    if (changeType === 'negative') return '↘'
    return '→'
  }

  if (isLoading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-surface-subtle rounded-lg"></div>
          <div className="w-16 h-6 bg-surface-subtle rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="w-20 h-8 bg-surface-subtle rounded"></div>
          <div className="w-24 h-4 bg-surface-subtle rounded"></div>
          <div className="w-16 h-3 bg-surface-subtle rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`card p-6 cursor-pointer transition-all duration-200 ${
        isHovered ? 'transform -translate-y-1' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-accent-light rounded-lg">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-caption font-medium ${
          changeType === 'positive' 
            ? 'bg-success-light text-success' 
            : changeType === 'negative'
            ? 'bg-error-light text-error'
            : 'bg-surface-subtle text-text-secondary'
        }`}>
          <span className="text-xs">{getChangeIcon()}</span>
          {change}
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-heading-2 font-semibold">{value}</h3>
        <p className="text-body-small font-medium">{title}</p>
        <p className="text-caption text-text-tertiary">{period}</p>
      </div>

      {/* Hover Effect */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent rounded-lg pointer-events-none" />
      )}
    </div>
  )
}

// Skeleton para loading
export function MetricCardSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-surface-subtle rounded-lg"></div>
        <div className="w-16 h-6 bg-surface-subtle rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="w-20 h-8 bg-surface-subtle rounded"></div>
        <div className="w-24 h-4 bg-surface-subtle rounded"></div>
        <div className="w-16 h-3 bg-surface-subtle rounded"></div>
      </div>
    </div>
  )
}

// Variantes especiais
export function MetricCardLarge({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  period,
  subtitle,
  onClick
}: MetricCardProps & { subtitle?: string }) {
  return (
    <div className="card p-8 cursor-pointer hover:shadow-lg transition-all duration-200" onClick={onClick}>
      <div className="flex items-start justify-between mb-6">
        <div className="p-3 bg-accent-light rounded-xl">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-body-small font-medium ${
          changeType === 'positive' 
            ? 'bg-success-light text-success' 
            : changeType === 'negative'
            ? 'bg-error-light text-error'
            : 'bg-surface-subtle text-text-secondary'
        }`}>
          <span>{changeType === 'positive' ? '↗' : changeType === 'negative' ? '↘' : '→'}</span>
          {change}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-4xl font-bold text-text">{value}</h3>
        <p className="text-heading-3 font-semibold">{title}</p>
        {subtitle && <p className="text-body text-text-secondary">{subtitle}</p>}
        <p className="text-caption text-text-tertiary">{period}</p>
      </div>
    </div>
  )
}

// Card compacto para sidebar
export function MetricCardCompact({
  title,
  value,
  icon: Icon,
  color = 'accent'
}: {
  title: string
  value: string
  icon: LucideIcon
  color?: 'accent' | 'success' | 'warning' | 'error'
}) {
  const colorClasses = {
    accent: 'bg-accent-light text-accent',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    error: 'bg-error-light text-error'
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-surface-subtle rounded-lg hover:bg-surface-hover transition-colors">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-semibold truncate">{value}</p>
        <p className="text-caption text-text-tertiary truncate">{title}</p>
      </div>
    </div>
  )
}
