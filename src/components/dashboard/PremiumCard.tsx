'use client'

import React, { memo } from 'react'
import { LucideIcon } from 'lucide-react'

interface PremiumCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  variant?: 'default' | 'elevated' | 'gradient'
  className?: string
  children?: React.ReactNode
}

export const PremiumCard = memo(({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className = '',
  children
}: PremiumCardProps) => {
  const baseClasses = `
    relative overflow-hidden transition-all duration-300 ease-out
    ${variant === 'elevated' ? 'card-elevated' : 'card-premium'}
    ${className}
  `

  const gradientClasses = variant === 'gradient' ? `
    bg-gradient-to-br from-brand-500 to-brand-600 text-white border-0
  ` : ''

  return (
    <div className={`${baseClasses} ${gradientClasses}`}>
      {/* Background Pattern for Gradient Cards */}
      {variant === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      )}
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className={`
              text-body-sm font-medium mb-1
              ${variant === 'gradient' ? 'text-white/80' : 'text-secondary'}
            `}>
              {title}
            </h3>
            
            <div className={`
              text-heading-xl font-bold
              ${variant === 'gradient' ? 'text-white' : 'text-primary'}
            `}>
              {value}
            </div>
            
            {subtitle && (
              <p className={`
                text-body-sm mt-1
                ${variant === 'gradient' ? 'text-white/70' : 'text-tertiary'}
              `}>
                {subtitle}
              </p>
            )}
          </div>
          
          {Icon && (
            <div className={`
              p-3 rounded-xl
              ${variant === 'gradient' 
                ? 'bg-white/20' 
                : 'bg-brand-50'
              }
            `}>
              <Icon className={`
                w-6 h-6
                ${variant === 'gradient' ? 'text-white' : 'text-brand-500'}
              `} />
            </div>
          )}
        </div>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2">
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-caption font-medium
              ${trend.isPositive 
                ? variant === 'gradient' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-success-50 text-success-500'
                : variant === 'gradient'
                  ? 'bg-white/20 text-white'
                  : 'bg-danger-50 text-danger-500'
              }
            `}>
              <span className={trend.isPositive ? '↗' : '↘'}>
                {trend.isPositive ? '↗' : '↘'}
              </span>
              {Math.abs(trend.value)}%
            </div>
            <span className={`
              text-body-sm
              ${variant === 'gradient' ? 'text-white/70' : 'text-tertiary'}
            `}>
              {trend.label}
            </span>
          </div>
        )}

        {/* Custom Content */}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  )
})

PremiumCard.displayName = 'PremiumCard'

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    period: string
  }
  icon?: LucideIcon
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'info'
}

export const MetricCard = memo(({
  title,
  value,
  change,
  icon: Icon,
  color = 'brand'
}: MetricCardProps) => {
  const colorClasses = {
    brand: 'bg-brand-50 text-brand-500',
    success: 'bg-success-50 text-success-500',
    warning: 'bg-warning-50 text-warning-500',
    danger: 'bg-danger-50 text-danger-500',
    info: 'bg-info-50 text-info-500'
  }

  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-body-sm font-medium text-secondary mb-2">{title}</p>
          <p className="text-heading-lg font-bold text-primary">{value}</p>
          
          {change && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`
                text-caption font-medium px-2 py-1 rounded-full
                ${change.value >= 0 ? 'bg-success-50 text-success-500' : 'bg-danger-50 text-danger-500'}
              `}>
                {change.value >= 0 ? '+' : ''}{change.value}%
              </span>
              <span className="text-body-sm text-tertiary">{change.period}</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  )
})

MetricCard.displayName = 'MetricCard'

interface StatsCardProps {
  title: string
  stats: Array<{
    label: string
    value: string | number
    trend?: number
  }>
  className?: string
}

export const StatsCard = memo(({ title, stats, className = '' }: StatsCardProps) => {
  return (
    <div className={`card-premium p-6 ${className}`}>
      <h3 className="text-heading-sm font-semibold text-primary mb-6">{title}</h3>
      
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-body-sm text-secondary">{stat.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-body-sm font-medium text-primary">{stat.value}</span>
              {stat.trend !== undefined && (
                <span className={`
                  text-caption font-medium
                  ${stat.trend >= 0 ? 'text-success-500' : 'text-danger-500'}
                `}>
                  {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

StatsCard.displayName = 'StatsCard'
