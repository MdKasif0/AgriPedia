import type { Config } from "tailwindcss";
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['DM Serif Display', ...defaultTheme.fontFamily.serif],
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
        // New theme accent colors
        'accent-emerald': 'hsl(var(--accent-emerald))',
        'accent-amber': 'hsl(var(--accent-amber))',
        'accent-blue': 'hsl(var(--accent-blue))',
        // New button color
        'button-primary': 'hsl(var(--button-primary))',
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
		borderRadius: {
			lg: 'var(--radius)', // Will be 1rem after CSS var change
			md: 'calc(var(--radius) - 0.25rem)', // Will be 0.75rem
			sm: 'calc(var(--radius) - 0.5rem)', // Will be 0.5rem
			xl: 'calc(var(--radius) + 0.25rem)', // Will be 1.25rem
        '2xl': 'calc(var(--radius) + 0.5rem)', // Will be 1.5rem
        '3xl': 'calc(var(--radius) + 0.75rem)',  // Capped at 1.75rem
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
        'pop': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
        },
        'leaf-sway': {
          '0%, 100%': { transform: 'rotate(-5deg) translateX(-2px)' }, // Added slight translateX for more organic feel
          '50%': { transform: 'rotate(5deg) translateX(2px)' },
        },
        'sprout': {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'tap-squish': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
        }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'pop': 'pop 0.3s ease-out',
        'leaf-sway': 'leaf-sway 3s ease-in-out infinite', // Slightly longer duration
        'sprout': 'sprout 0.4s ease-out forwards',
        'tap-squish': 'tap-squish 0.2s ease-in-out',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
