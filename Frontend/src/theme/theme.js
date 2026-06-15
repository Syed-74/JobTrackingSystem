export const theme = {
    colors: {
        primary: {
            DEFAULT: '#4f46e5',
            hover: '#4338ca',
            active: '#3730a3',
            light: '#eeebff',
        },
        secondary: {
            DEFAULT: '#0ea5e9',
            hover: '#0284c7',
            light: '#e0f2fe',
        },
        success: {
            DEFAULT: '#10b981',
            light: '#ecfdf5',
        },
        warning: {
            DEFAULT: '#f59e0b',
            light: '#fffbeb',
        },
        danger: {
            DEFAULT: '#ef4444',
            light: '#fef2f2',
        },
        info: {
            DEFAULT: '#3b82f6',
            light: '#eff6ff',
        },
        neutral: {
            base: '#f8fafc',
            surface: '#ffffff',
            muted: '#f1f5f9',
            text: '#0f172a',
            textMuted: '#64748b',
            textInverse: '#ffffff',
            border: '#e2e8f0',
            borderMuted: '#f1f5f9',
        }
    },
    fontFamily: {
        base: "'Plus Jakarta Sans', 'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
    },
    borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
    },
    boxShadow: {
        sm: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        md: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
        xl: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
        glow: '0 0 20px 2px rgba(79, 70, 229, 0.15)',
    },
    spacing: {
        1: '0.25rem',   /* 4px */
        2: '0.5rem',    /* 8px */
        3: '0.75rem',   /* 12px */
        4: '1rem',      /* 16px */
        5: '1.25rem',   /* 20px */
        6: '1.5rem',    /* 24px */
        8: '2rem',      /* 32px */
        10: '2.5rem',   /* 40px */
        12: '3rem',     /* 48px */
        16: '4rem',     /* 64px */
    }
};

export default theme;
