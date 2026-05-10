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
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
			boxShadow: {
				panelSoft: '0 10px 24px -16px hsl(var(--ui-overlay-strong) / 0.9)',
				panelGlow: '0 0 0 1px hsl(var(--ui-stroke-soft) / 0.45), 0 14px 28px -18px hsl(var(--ui-accent) / 0.65)'
			},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
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
				'ui-bg': {
					0: 'hsl(var(--ui-bg-0))',
					1: 'hsl(var(--ui-bg-1))',
					2: 'hsl(var(--ui-bg-2))'
				},
				'ui-surface': {
					0: 'hsl(var(--ui-surface-0))',
					1: 'hsl(var(--ui-surface-1))',
					2: 'hsl(var(--ui-surface-2))'
				},
				'ui-overlay': {
					weak: 'hsl(var(--ui-overlay-weak))',
					strong: 'hsl(var(--ui-overlay-strong))'
				},
				'ui-stroke': {
					soft: 'hsl(var(--ui-stroke-soft))',
					strong: 'hsl(var(--ui-stroke-strong))'
				},
				'ui-text': {
					1: 'hsl(var(--ui-text-1))',
					2: 'hsl(var(--ui-text-2))',
					3: 'hsl(var(--ui-text-3))'
				},
				'ui-accent': {
					DEFAULT: 'hsl(var(--ui-accent))',
					muted: 'hsl(var(--ui-accent-muted))'
				},
				'ui-state': {
					success: 'hsl(var(--ui-state-success))',
					warn: 'hsl(var(--ui-state-warn))',
					danger: 'hsl(var(--ui-state-danger))',
					info: 'hsl(var(--ui-state-info))'
				},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
