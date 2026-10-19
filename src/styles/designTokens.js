/**
 * Design System Tokens for Incentives Module Professional Redesign
 * 
 * This file defines all design tokens used across the incentives module.
 * Tokens are organized by category: Typography, Colors, Spacing, Shadows, and Animations.
 */

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const typography = {
  // Font Families
  fonts: {
    primary: "'Manrope', 'Inter', 'Hanken Grotesk', system-ui, -apple-system, sans-serif",
    headings: "'Hanken Grotesk', 'Inter', system-ui, sans-serif",
    mono: "'SF Mono', 'Consolas', 'Monaco', monospace",
  },

  // Type Scale (font sizes in pixels)
  sizes: {
    // Headings
    h1: '20px',
    h2: '18px',
    h3: '15px',
    h4: '14px',
    
    // Body Text
    base: '13px',
    small: '12.5px',
    tiny: '11.5px',
    micro: '10.5px',
  },

  // Font Weights
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.035em',
    normal: '0',
    wide: '0.045em',
    wider: '0.13em',
  },
};

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary Brand Colors
  brand: {
    DEFAULT: '#285498',
    hover: '#234690',
    bright: '#3b82f6',
    light: '#4085E4',
  },

  // Navy Family
  navy: {
    900: '#081a38',
    800: '#0d2650',
  },

  // Accent Colors
  accent: {
    sky: '#38bdf8',
    amber: '#fbbf24',
  },

  // Semantic Colors
  success: {
    DEFAULT: '#166534',
    bg: '#dcfce7',
    light: '#f0fdf4',
    border: '#bbf7d0',
  },

  warning: {
    DEFAULT: '#d97706',
    text: '#92400e',
    bg: '#fffbeb',
    light: '#fef9c3',
    border: '#fde68a',
  },

  error: {
    DEFAULT: '#ba1a1a',
    bg: '#ffdad6',
    light: '#fef2f2',
    border: '#fecaca',
  },

  info: {
    DEFAULT: '#1e3a8a',
    bg: '#dbe5f8',
    light: '#eaf1fc',
  },

  frozen: {
    DEFAULT: '#3730a3',
    bg: '#e0e7ff',
    light: '#f5f3ff',
  },

  // Neutral Grays (12-shade scale)
  gray: {
    ink: '#111827',
    900: '#1f2937',
    800: '#374151',
    700: '#4b5563',
    600: '#6b7280',
    500: '#9ca3af',
    400: '#c5d3e4',
    300: '#d4e0f0',
    200: '#e2e9f4',
    150: '#eef2fb',
    100: '#f0f4fa',
    50: '#f8fafd',
    white: '#ffffff',
  },

  // Background Colors
  surface: '#f6f8fc',
  card: '#ffffff',
  inputBg: '#f8fafd',
  tableBg: '#f8fafd',
  hoverBg: '#f0f4fa',
};

// ============================================================================
// SPACING SCALE
// ============================================================================

export const spacing = {
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};

// Spacing Guidelines
export const spacingGuidelines = {
  cardPadding: '20-24px',       // spacing[5-6]
  sectionMargin: '16-20px',     // spacing[4-5]
  fieldSpacing: '12-16px',      // spacing[3-4]
  componentGap: '8-16px',       // spacing[2-4]
  tableCellX: '12-16px',        // spacing[3-4]
  tableCellY: '10-12px',        // spacing[2.5-3]
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  sm: '4-6px',
  md: '6-8px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
};

// ============================================================================
// SHADOWS & ELEVATION
// ============================================================================

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.1)',
  DEFAULT: '0 2px 8px rgba(13,39,74,0.04)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
  '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
};

// ============================================================================
// ANIMATION & TRANSITIONS
// ============================================================================

export const animations = {
  // Duration
  duration: {
    fast: '150ms',
    base: '200ms',
    medium: '300ms',
    slow: '400ms',
  },

  // Easing Functions
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },

  // Common Transitions
  transitions: {
    colors: 'background-color 150ms ease-in-out, border-color 150ms ease-in-out, color 150ms ease-in-out',
    all: 'all 200ms ease-in-out',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  // Button
  button: {
    minHeight: '36px',
    paddingX: '12-16px',
    paddingY: '8-10px',
    fontSize: '12.5-13px',
    fontWeight: 500-600,
  },

  // Input
  input: {
    minHeight: '36px',
    padding: '8-10px 12px',
    fontSize: '13px',
    borderWidth: '1px',
  },

  // Badge
  badge: {
    paddingX: '6-10px',
    paddingY: '2-4px',
    fontSize: '11-12px',
    fontWeight: 500,
  },

  // Card
  card: {
    padding: '20-24px',
    borderRadius: '12px',
  },

  // Modal
  modal: {
    maxWidth: '480-600px',
    backdropBlur: '4-8px',
    backdropColor: 'rgba(15,32,68,0.35)',
  },

  // Table
  table: {
    headerBg: '#f8fafd',
    headerFont: '11px',
    bodyFont: '13px',
    cellPaddingX: '12-16px',
    cellPaddingY: '10-12px',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a color value with opacity
 * @param {string} color - The color hex value
 * @param {number} opacity - Opacity value between 0 and 1
 * @returns {string} - RGBA color string
 */
export function withOpacity(color, opacity) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Generate CSS custom properties from tokens
 * @returns {object} - CSS custom properties object
 */
export function generateCSSVariables() {
  return {
    '--font-primary': typography.fonts.primary,
    '--font-headings': typography.fonts.headings,
    '--font-mono': typography.fonts.mono,
    '--color-brand': colors.brand.DEFAULT,
    '--color-brand-hover': colors.brand.hover,
    '--spacing-base': spacing[4],
    '--radius-base': borderRadius.md,
    '--shadow-default': shadows.DEFAULT,
    '--transition-base': animations.transitions.all,
  };
}

// Export default object with all tokens
export default {
  typography,
  colors,
  spacing,
  borderRadius,
  shadows,
  animations,
  components,
  withOpacity,
  generateCSSVariables,
};