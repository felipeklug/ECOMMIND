'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { useSidebar } from '@/hooks/useSidebar'

interface SidebarItemProps {
  href: string
  icon: LucideIcon
  label: string
  description?: string
  badge?: string | number
  onClick?: () => void
}

export function SidebarItem({ 
  href, 
  icon: Icon, 
  label, 
  description, 
  badge,
  onClick 
}: SidebarItemProps) {
  const pathname = usePathname()
  const { isCollapsed, closeMobile } = useSidebar()
  
  const isActive = pathname === href || pathname.startsWith(href + '/')
  
  const handleClick = () => {
    closeMobile()
    onClick?.()
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
        transition-all duration-200 ease-in-out
        hover:bg-surface-hover focus:bg-surface-hover focus:outline-none
        ${isActive 
          ? 'bg-brand-500 text-white shadow-lg' 
          : 'text-text hover:text-text'
        }
        ${isCollapsed ? 'justify-center' : ''}
      `}
    >
      {/* Icon */}
      <div className={`
        flex-shrink-0 flex items-center justify-center
        ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}
        transition-all duration-200
      `}>
        <Icon className={`
          ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}
          ${isActive ? 'text-white' : 'text-current'}
          transition-all duration-200
        `} />
      </div>

      {/* Label and Description */}
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={`
              font-medium text-sm truncate
              ${isActive ? 'text-white' : 'text-current'}
            `}>
              {label}
            </span>
            
            {badge && (
              <span className={`
                px-1.5 py-0.5 text-xs font-medium rounded-full
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-accent-light text-accent'
                }
              `}>
                {badge}
              </span>
            )}
          </div>
          
          {description && (
            <p className={`
              text-xs mt-0.5 truncate
              ${isActive ? 'text-white/80' : 'text-muted'}
            `}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className={`
          absolute left-full ml-2 px-2 py-1 bg-surface border border-border
          rounded-md shadow-lg text-sm font-medium whitespace-nowrap
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 z-50
          ${isActive ? 'bg-brand-500 text-white border-brand-500' : 'text-text'}
        `}>
          {label}
          {badge && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-accent-light text-accent rounded-full">
              {badge}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
