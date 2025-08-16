import React from 'react'

// Mercado Livre Logo
export const MercadoLivreLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#FFE600"/>
    <path d="M7.5 8.5C7.5 7.67157 8.17157 7 9 7H15C15.8284 7 16.5 7.67157 16.5 8.5V15.5C16.5 16.3284 15.8284 17 15 17H9C8.17157 17 7.5 16.3284 7.5 15.5V8.5Z" fill="#2D3277"/>
    <path d="M9.5 9.5H14.5V10.5H9.5V9.5Z" fill="#FFE600"/>
    <path d="M9.5 11.5H14.5V12.5H9.5V11.5Z" fill="#FFE600"/>
    <path d="M9.5 13.5H12.5V14.5H9.5V13.5Z" fill="#FFE600"/>
  </svg>
)

// Shopee Logo
export const ShopeeLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#EE4D2D"/>
    <path d="M12 6L14.5 10.5H9.5L12 6Z" fill="white"/>
    <path d="M7 11H17C17.5523 11 18 11.4477 18 12V16C18 16.5523 17.5523 17 17 17H7C6.44772 17 6 16.5523 6 16V12C6 11.4477 6.44772 11 7 11Z" fill="white"/>
    <circle cx="9" cy="14" r="1" fill="#EE4D2D"/>
    <circle cx="15" cy="14" r="1" fill="#EE4D2D"/>
  </svg>
)

// Amazon Logo
export const AmazonLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#FF9900"/>
    <path d="M8 8H16V9H8V8Z" fill="white"/>
    <path d="M8 10H16V11H8V10Z" fill="white"/>
    <path d="M8 12H14V13H8V12Z" fill="white"/>
    <path d="M6 15C6 14.4477 6.44772 14 7 14H17C17.5523 14 18 14.4477 18 15C18 15.5523 17.5523 16 17 16H7C6.44772 16 6 15.5523 6 15Z" fill="white"/>
    <path d="M7 15L17 15" stroke="#FF9900" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// Loja Própria Logo
export const LojaPropriaLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#8B5CF6"/>
    <path d="M12 6L15 9H9L12 6Z" fill="white"/>
    <path d="M8 10H16V17H8V10Z" fill="white"/>
    <path d="M10 12H14V15H10V12Z" fill="#8B5CF6"/>
    <circle cx="11" cy="13.5" r="0.5" fill="white"/>
  </svg>
)

// WhatsApp Logo
export const WhatsAppLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#25D366"/>
    <path d="M12 6C8.68629 6 6 8.68629 6 12C6 13.2 6.35 14.32 6.95 15.25L6 18L8.75 17.05C9.68 17.65 10.8 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6Z" fill="white"/>
    <path d="M15.5 13.5C15.5 13.5 14.5 14 12 14C9.5 14 8.5 13.5 8.5 13.5C8.5 13.5 8.5 11.5 8.5 10.5C8.5 9.5 9.5 9 12 9C14.5 9 15.5 9.5 15.5 10.5C15.5 11.5 15.5 13.5 15.5 13.5Z" fill="#25D366"/>
  </svg>
)

// Função helper para obter logo por canal
export const getChannelLogo = (channel: string, className?: string) => {
  const normalizedChannel = channel.toLowerCase().replace(/\s+/g, '')
  
  switch (normalizedChannel) {
    case 'mercadolivre':
    case 'ml':
      return <MercadoLivreLogo className={className} />
    case 'shopee':
      return <ShopeeLogo className={className} />
    case 'amazon':
      return <AmazonLogo className={className} />
    case 'lojaprópria':
    case 'lojapropria':
    case 'site':
      return <LojaPropriaLogo className={className} />
    case 'whatsapp':
      return <WhatsAppLogo className={className} />
    default:
      return <LojaPropriaLogo className={className} />
  }
}

export type ChannelType = 'mercadolivre' | 'shopee' | 'amazon' | 'lojapropria' | 'whatsapp'
