/**
 * Indexel Brand Design Tokens
 * Premium Enterprise UI Design System
 */

export const colors = {
  // Brand Colors
  primary: {
    DEFAULT: '#285598',
    dark: '#0D274A',
    accent: '#4085E4',
    light: '#D4E4FB',
  },
  teal: '#0298CA',
  
  // Neutrals
  gray: {
    900: '#24252A',
    800: '#3A3B42',
    700: '#52535A',
    600: '#6B6C73',
    500: '#84858C',
    400: '#9D9EA4',
    300: '#B6B7BC',
    200: '#CFD0D4',
    100: '#E8E8EA',
    50: '#F7F8FA',
  },
  
  // Semantic
  white: '#FFFFFF',
  background: '#F7F8FA',
  
  // Status
  success: {
    DEFAULT: '#10B981',
    light: '#D1FAE5',
    dark: '#065F46',
  },
  warning: {
    DEFAULT: '#F59E0B',
    light: '#FEF3C7',
    dark: '#92400E',
  },
  error: {
    DEFAULT: '#EF4444',
    light: '#FEE2E2',
    dark: '#991B1B',
  },
  info: {
    DEFAULT: '#3B82F6',
    light: '#DBEAFE',
    dark: '#1E3A8A',
  },
};

export const typography = {
  fontFamily: {
    base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.25,
    base: 1.5,
    relaxed: 1.75,
  },
  
  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.025em',
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

export const borderRadius = {
  none: '0',
  sm: '0.375rem',   // 6px
  base: '0.5rem',   // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.25rem',    // 20px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(13, 39, 74, 0.05)',
  base: '0 1px 3px 0 rgba(13, 39, 74, 0.1), 0 1px 2px -1px rgba(13, 39, 74, 0.1)',
  md: '0 4px 6px -1px rgba(13, 39, 74, 0.1), 0 2px 4px -2px rgba(13, 39, 74, 0.1)',
  lg: '0 10px 15px -3px rgba(13, 39, 74, 0.1), 0 4px 6px -4px rgba(13, 39, 74, 0.1)',
  xl: '0 20px 25px -5px rgba(13, 39, 74, 0.1), 0 8px 10px -6px rgba(13, 39, 74, 0.1)',
  inner: 'inset 0 2px 4px 0 rgba(13, 39, 74, 0.05)',
  none: 'none',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  modal: 1030,
  popover: 1040,
  tooltip: 1050,
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};