'use client'

import { useState } from 'react'
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  Package, 
  ArrowUpRight, 
  X,
  CheckCircle,
  MoreHorizontal,
  Filter
} from 'lucide-react'

interface Alert {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
  time: string
  action: string
  category: 'stock' | 'margin' | 'sales' | 'system'
  isRead: boolean
  data?: any
}

interface AlertsPanelProps {
  alerts: Alert[]
  onAlertAction?: (alertId: string, action: string) => void
  onMarkAsRead?: (alertId: string) => void
  onDismiss?: (alertId: string) => void
}

export function AlertsPanel({ 
  alerts, 
  onAlertAction, 
  onMarkAsRead, 
  onDismiss 
}: AlertsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'unread'>('all')
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)

  const getAlertIcon = (type: string, category: string) => {
    if (category === 'stock') return Package
    if (category === 'margin') return TrendingDown
    if (category === 'system') return Clock
    
    switch (type) {
      case 'warning': return AlertTriangle
      case 'error': return AlertTriangle
      case 'success': return CheckCircle
      default: return Clock
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-warning'
      case 'error': return 'text-error'
      case 'info': return 'text-info'
      case 'success': return 'text-success'
      default: return 'text-text-secondary'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error-light text-error'
      case 'medium':
        return 'bg-warning-light text-warning'
      case 'low':
        return 'bg-info-light text-info'
      default:
        return 'bg-surface-subtle text-text-secondary'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'high') return alert.priority === 'high'
    if (filter === 'unread') return !alert.isRead
    return true
  })

  const criticalCount = alerts.filter(a => a.priority === 'high').length
  const unreadCount = alerts.filter(a => !a.isRead).length

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-heading-3 font-semibold">Alertas</h3>
          <p className="text-caption text-text-tertiary mt-1">
            {unreadCount} não lidos • {criticalCount} críticos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="flex items-center bg-surface-subtle rounded-lg p-1">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'high', label: 'Críticos' },
              { value: 'unread', label: 'Não lidos' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as any)}
                className={`px-3 py-1 text-caption font-medium rounded-md transition-all ${
                  filter === option.value
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <button className="p-2 hover:bg-surface-subtle rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="text-body text-text-secondary">Nenhum alerta encontrado</p>
            <p className="text-caption text-text-tertiary">Tudo funcionando perfeitamente!</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const IconComponent = getAlertIcon(alert.type, alert.category)
            const isExpanded = expandedAlert === alert.id
            
            return (
              <div
                key={alert.id}
                className={`relative p-4 rounded-lg border transition-all duration-200 ${
                  alert.isRead 
                    ? 'bg-surface border-border-light' 
                    : 'bg-surface-subtle border-border hover:border-accent'
                } ${isExpanded ? 'ring-2 ring-accent/20' : ''}`}
              >
                {/* Priority Indicator */}
                {alert.priority === 'high' && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse" />
                )}

                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg bg-surface-subtle ${getAlertColor(alert.type)}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="text-body font-medium mb-1">{alert.title}</h4>
                        <p className="text-body-small text-text-secondary">{alert.message}</p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!alert.isRead && (
                          <button
                            onClick={() => onMarkAsRead?.(alert.id)}
                            className="p-1 hover:bg-surface-hover rounded transition-colors"
                            title="Marcar como lido"
                          >
                            <CheckCircle className="w-4 h-4 text-text-tertiary" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => onDismiss?.(alert.id)}
                          className="p-1 hover:bg-surface-hover rounded transition-colors"
                          title="Dispensar"
                        >
                          <X className="w-4 h-4 text-text-tertiary" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-caption text-text-tertiary">{alert.time}</span>
                        <span className={`px-2 py-0.5 rounded-full text-caption font-medium ${getPriorityBadge(alert.priority)}`}>
                          {alert.priority === 'high' ? 'Urgente' : 
                           alert.priority === 'medium' ? 'Médio' : 'Baixo'}
                        </span>
                      </div>
                      
                      {/* Action Button */}
                      <button
                        onClick={() => {
                          onAlertAction?.(alert.id, alert.action)
                          setExpandedAlert(isExpanded ? null : alert.id)
                        }}
                        className="btn-ghost btn-sm flex items-center gap-1 hover:bg-accent hover:text-white transition-all"
                      >
                        <span>{alert.action}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && alert.data && (
                      <div className="mt-3 pt-3 border-t border-border-light">
                        <div className="grid grid-cols-2 gap-3 text-caption">
                          {Object.entries(alert.data).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-text-tertiary">{key}:</span>
                              <span className="ml-1 font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer Actions */}
      {filteredAlerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border-light">
          <div className="flex gap-3">
            <button 
              className="btn-secondary flex-1"
              onClick={() => filteredAlerts.forEach(alert => onMarkAsRead?.(alert.id))}
            >
              Marcar Todos como Lidos
            </button>
            <button className="btn-primary flex-1">
              <Filter className="w-4 h-4 mr-2" />
              Configurar Alertas
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Skeleton para loading
export function AlertsPanelSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="w-20 h-6 bg-surface-subtle rounded mb-2"></div>
          <div className="w-32 h-4 bg-surface-subtle rounded"></div>
        </div>
        <div className="w-24 h-8 bg-surface-subtle rounded"></div>
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-surface-subtle rounded-lg">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-surface-hover rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-surface-hover rounded"></div>
                <div className="w-full h-3 bg-surface-hover rounded"></div>
                <div className="w-1/2 h-3 bg-surface-hover rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
