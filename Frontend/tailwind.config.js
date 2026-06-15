import { theme } from './src/theme/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        success: theme.colors.success,
        warning: theme.colors.warning,
        danger: theme.colors.danger,
        info: theme.colors.info,
        neutral: {
          base: theme.colors.neutral.base,
          surface: theme.colors.neutral.surface,
          muted: theme.colors.neutral.muted,
          text: theme.colors.neutral.text,
          'text-muted': theme.colors.neutral.textMuted,
          'text-inverse': theme.colors.neutral.textInverse,
          border: theme.colors.neutral.border,
          'border-muted': theme.colors.neutral.borderMuted,
        }
      },
      fontFamily: {
        sans: [theme.fontFamily.base, 'sans-serif'],
      },
      borderRadius: {
        'theme-sm': theme.borderRadius.sm,
        'theme-md': theme.borderRadius.md,
        'theme-lg': theme.borderRadius.lg,
        'theme-xl': theme.borderRadius.xl,
        'theme-2xl': theme.borderRadius['2xl'],
        'theme-3xl': theme.borderRadius['3xl'],
      },
      boxShadow: {
        'theme-sm': theme.boxShadow.sm,
        'theme-md': theme.boxShadow.md,
        'theme-lg': theme.boxShadow.lg,
        'theme-xl': theme.boxShadow.xl,
        'theme-glow': theme.boxShadow.glow,
      },
      spacing: {
        'theme-1': theme.spacing[1],
        'theme-2': theme.spacing[2],
        'theme-3': theme.spacing[3],
        'theme-4': theme.spacing[4],
        'theme-5': theme.spacing[5],
        'theme-6': theme.spacing[6],
        'theme-8': theme.spacing[8],
        'theme-10': theme.spacing[10],
        'theme-12': theme.spacing[12],
        'theme-16': theme.spacing[16],
      }
    },
  },
  plugins: [],
}