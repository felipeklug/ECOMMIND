interface BrainLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  variant?: 'default' | 'white'
}

export function BrainLogo({ size = 'md', className = '', variant = 'default' }: BrainLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  // Logo original do usuário - mantendo a arte, só mudando a cor para roxo da marca
  const color = variant === 'white' ? '#FFFFFF' : '#7C3AED' // Roxo da marca

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Cérebro minimalista - apenas o contorno simples */}
        <path
          d="M25 40C25 30 30 25 40 25C45 20 50 20 55 20C60 20 65 20 70 25C80 25 85 30 85 40C85 45 85 50 85 55C85 65 80 70 70 70C65 75 60 75 55 75C50 75 45 75 40 70C30 70 25 65 25 55C25 50 25 45 25 40Z"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Divisão central simples do cérebro */}
        <path
          d="M50 25C50 35 50 45 50 65"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}