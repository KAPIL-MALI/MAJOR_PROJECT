/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        prime: {
          blue: '#2563eb',
          dark: '#0f172a',
          darker: '#020617',
          light: '#f8fafc',
          accent: '#38bdf8',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(56, 189, 248, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(56, 189, 248, 0.6)' },
        }
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        DEFAULT: '0 4px 14px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 6px 20px 0 rgba(0, 0, 0, 0.08)',
        'lg': '0 10px 30px 0 rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 40px -4px rgba(0, 0, 0, 0.12)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#10B981",
          secondary: "#6366F1",
          accent: "#F59E0B",
          neutral: "#9CA3AF",
          "base-100": "#FAFAFA",
          "base-200": "#F4F4F5",
          "base-300": "#E4E4E7",
          "base-content": "#1F2937",
          info: "#10B981",
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",
          "--rounded-box": "1.25rem", // 20px
          "--rounded-btn": "0.75rem", // 12px
          "--tab-radius": "0.75rem",
        },
        dark: {
          primary: "#10B981",
          secondary: "#6366F1",
          accent: "#F59E0B",
          neutral: "#3A3A3C",
          "base-100": "#0A0A0F",
          "base-200": "#12121A",
          "base-300": "#1A1A25",
          "base-content": "#E5E7EB",
          info: "#10B981",
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",
          "--rounded-box": "1.25rem",
          "--rounded-btn": "0.75rem",
          "--tab-radius": "0.75rem",
        },
      },
    ],
  },
}