/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ECOMMIND Premium Fintech Palette
        primary: {
          50: '#f0f1f3',
          100: '#d4d7dd',
          200: '#a9b0c0',
          300: '#7d89a3',
          400: '#526286',
          500: '#273b69',
          600: '#1f2f54',
          700: '#17233f',
          800: '#0f172a',
          900: '#0B0D17', // Azul petróleo profundo - base dark sofisticada
        },
        accent: {
          50: '#e6fffa',
          100: '#b3fff0',
          200: '#80ffe6',
          300: '#4dffdc',
          400: '#1affd2',
          500: '#00FFB2', // Verde menta neon - destaque KPIs positivos
          600: '#00e6a0',
          700: '#00cc8e',
          800: '#00b37c',
          900: '#00996a',
        },
        electric: {
          50: '#f3f0ff',
          100: '#e0d4ff',
          200: '#c7b3ff',
          300: '#ae92ff',
          400: '#9571ff',
          500: '#7C3AED', // Roxo elétrico - ações e botões principais
          600: '#6d32d6',
          700: '#5e2abf',
          800: '#4f22a8',
          900: '#401a91',
        },
        neutral: {
          50: '#f9f9f9',
          100: '#f5f5f5', // Cinza claro para contraste
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#1E1E1E', // Cinza carvão
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#FF4C4C', // Vermelho para alertas
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFB800', // Amarelo dourado para alertas
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // CSS Variables para compatibilidade com Shadcn
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}