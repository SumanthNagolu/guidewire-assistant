import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			// InTimeSolutions Brand Colors
  			'trust-blue': {
  				DEFAULT: '#003D82',
  				50: '#E6EEF7',
  				100: '#CCE0F0',
  				500: '#003D82',
  				600: '#002D5F',
  				700: '#001F42',
  			},
  			'success-green': {
  				DEFAULT: '#00A86B',
  				50: '#E6F7F0',
  				100: '#CCF0E0',
  				500: '#00A86B',
  				600: '#008554',
  				700: '#00633F',
  			},
  			'innovation-orange': {
  				DEFAULT: '#FF6B35',
  				50: '#FFE8E0',
  				100: '#FFD4C2',
  				500: '#FF6B35',
  				600: '#E84D1C',
  				700: '#C43510',
  			},
  			'wisdom-gray': {
  				DEFAULT: '#4A5568',
  				50: '#F7FAFC',
  				100: '#EDF2F7',
  				200: '#E2E8F0',
  				300: '#CBD5E0',
  				400: '#A0AEC0',
  				500: '#4A5568',
  				600: '#2D3748',
  				700: '#1A202C',
  			},
  			'sky-blue': {
  				DEFAULT: '#90CDF4',
  				500: '#90CDF4',
  			},
  			// Shadcn-compatible mappings
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  		},
  		fontFamily: {
  			'sans': ['Inter', 'Segoe UI', 'sans-serif'],
  			'heading': ['Montserrat', 'Helvetica Neue', 'sans-serif'],
  			'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
  		},
		fontSize: {
			'h1': ['48px', { lineHeight: '56px', fontWeight: '700' }],
			'h2': ['36px', { lineHeight: '44px', fontWeight: '600' }],
			'h3': ['28px', { lineHeight: '36px', fontWeight: '600' }],
			'h4': ['24px', { lineHeight: '32px', fontWeight: '500' }],
			'h5': ['20px', { lineHeight: '28px', fontWeight: '500' }],
			// Deloitte-inspired giant display sizes
			'display-sm': ['64px', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.02em' }],
			'display': ['80px', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.02em' }],
			'display-lg': ['96px', { lineHeight: '1', fontWeight: '900', letterSpacing: '-0.02em' }],
			'display-xl': ['120px', { lineHeight: '1', fontWeight: '900', letterSpacing: '-0.03em' }],
		},
		spacing: {
			'section': '64px',
			'component': '32px',
			'section-lg': '96px',
			'section-xl': '128px',
		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [],
};
export default config;

