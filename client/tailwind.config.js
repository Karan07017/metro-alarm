/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0B10',
        surface: '#12141B',
        'surface-2': '#181B24',
        border: 'rgba(255,255,255,0.08)',
        'border-hover': 'rgba(255,255,255,0.16)',
        text: '#E7E8EC',
        muted: '#8B8E9B',
        faint: '#5A5D6B',
        gps: {
          from: '#7C5CFF',
          to: '#22D3EE',
        },
        time: {
          from: '#FFB347',
          to: '#FF6B4A',
        },
        success: '#34D399',
        danger: '#FB7185',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.35)',
        glow: '0 0 0 1px rgba(124,92,255,0.4), 0 0 24px rgba(124,92,255,0.35)',
        'glow-time': '0 0 0 1px rgba(255,179,71,0.4), 0 0 24px rgba(255,179,71,0.35)',
      },
      backgroundImage: {
        'gradient-gps': 'linear-gradient(135deg, #7C5CFF 0%, #22D3EE 100%)',
        'gradient-time': 'linear-gradient(135deg, #FFB347 0%, #FF6B4A 100%)',
        'gradient-radial-glow':
          'radial-gradient(60% 60% at 50% 0%, rgba(124,92,255,0.18) 0%, rgba(10,11,16,0) 70%)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.2,0.6,0.4,1) infinite',
        shimmer: 'shimmer 1.6s infinite linear',
      },
    },
  },
  plugins: [],
}
