# Design Document: Incentives Professional Redesign

## Overview

This document defines the technical design for the professional visual redesign of the incentives module. The redesign establishes a cohesive design system based on the existing LoginPage patterns, introducing refined typography, a polished color palette, consistent spacing, and professional component styling across all five incentive management panels.

### Design Goals

1. **Visual Consistency**: Establish a unified design language across all incentive panels that matches the application's professional aesthetic
2. **Enhanced Readability**: Improve typography hierarchy and spacing for better information scanning
3. **Polished Interactions**: Add smooth transitions, refined hover states, and clear visual feedback
4. **Professional Appeal**: Elevate the visual design to match enterprise-grade applications
5. **Accessibility**: Maintain WCAG AA compliance with proper contrast ratios and keyboard navigation
6. **Maintainability**: Document all design tokens and patterns for consistent implementation

### Scope

The redesign applies to these five panels:
1. **IncentiveOrders** — Main orders listing with target progress visualization
2. **OrderForm** — Order creation and editing with live incentive calculation
3. **IncentiveSchemes** — Scheme management listing
4. **EmployeeTargets** — Target assignment and tracking
5. **EmployeeOrdersPanel** — Administrative order viewing and freezing

## Architecture

### Design System Structure

```
Design System
├── Foundation Layer
│   ├── Typography System
│   ├── Color Palette
│   ├── Spacing Scale
│   ├── Shadows & Elevation
│   └── Animation Timing
├── Component Layer
│   ├── Form Elements (inputs, selects, textareas)
│   ├── Buttons (primary, secondary, icon, ghost)
│   ├── Cards & Containers
│   ├── Tables
│   ├── Badges & Status Indicators
│   ├── Modals & Overlays
│   └── Alerts & Messages
└── Pattern Layer
    ├── Page Headers
    ├── Filter Bars
    ├── Data Visualization
    ├── Empty States
    └── Loading States
```

### Technology Stack

- **Framework**: React with functional components and hooks
- **Styling**: Tailwind CSS utility classes with custom design tokens
- **Icons**: Material Symbols Outlined (consistent with current implementation)
- **Fonts**: Manrope (body), Hanken Grotesk (headings), system fallbacks

## Components and Interfaces

### 1. Design System Tokens

#### Typography System

**Font Families**:
```css
--font-primary: 'Manrope', 'Inter', 'Hanken Grotesk', system-ui, -apple-system, sans-serif
--font-headings: 'Hanken Grotesk', 'Inter', system-ui, sans-serif
--font-mono: 'SF Mono', 'Consolas', 'Monaco', monospace
```

**Type Scale**:
```javascript
{
  // Headings
  h1: '20px',  // Page titles
  h2: '16-18px', // Section headers
  h3: '15px',  // Card headers
  h4: '14px',  // Sub-headers
  
  // Body Text
  base: '13px',       // Main body text
  small: '12-12.5px', // Helper text, labels
  tiny: '11-11.5px',  // Status badges, counts
  micro: '10-10.5px', // Table captions, KPI labels
}
```

**Font Weights**:
```javascript
{
  regular: 400,  // Body text
  medium: 500,   // Labels, emphasized text
  semibold: 600, // Headings, buttons
  bold: 700,     // Page titles, KPI values
}
```

**Line Heights**:
```javascript
{
  tight: 1.2,    // Headings, KPI values
  normal: 1.5,   // Body text
  relaxed: 1.6,  // Long-form content
}
```

**Letter Spacing**:
```javascript
{
  tight: '-0.035em',  // Large headings
  normal: '0',        // Body text
  wide: '0.045-0.08em', // Uppercase labels
  wider: '0.13em',    // Section headings
}
```

#### Color Palette

**Primary Brand Colors**:
```javascript
{
  // Navy family (from LoginPage)
  navy900: '#081a38',
  navy800: '#0d2650',
  
  // Brand blue family
  brand: '#285498',     // Main brand color (#2d55a0 variants acceptable)
  brandHover: '#234690',
  brandBright: '#3b82f6',
  brandLight: '#4085E4',
  
  // Accent colors
  sky: '#38bdf8',
  amber: '#fbbf24',
}
```

**Semantic Colors**:
```javascript
{
  // Success (green)
  success: {
    DEFAULT: '#166534',
    bg: '#dcfce7',
    light: '#f0fdf4',
    border: '#bbf7d0',
  },
  
  // Warning (amber)
  warning: {
    DEFAULT: '#d97706',
    text: '#92400e',
    bg: '#fffbeb',
    light: '#fef9c3',
    border: '#fde68a',
  },
  
  // Error (red)
  error: {
    DEFAULT: '#ba1a1a',
    bg: '#ffdad6',
    light: '#fef2f2',
    border: '#fecaca',
  },
  
  // Info (blue)
  info: {
    DEFAULT: '#1e3a8a',
    bg: '#dbe5f8',
    light: '#eaf1fc',
  },
  
  // Frozen/Special (indigo)
  frozen: {
    DEFAULT: '#3730a3',
    bg: '#e0e7ff',
    light: '#f5f3ff',
  },
}
```

**Neutral Grays**:
```javascript
{
  ink: '#111827',      // Darkest text (#0f1c36 acceptable)
  gray900: '#1f2937',
  gray800: '#374151',
  gray700: '#4b5563',
  gray600: '#6b7280',  // Secondary text
  gray500: '#9ca3af',  // Placeholder text
  gray400: '#c5d3e4',  // Borders
  gray300: '#d4e0f0',  // Light borders
  gray200: '#e2e9f4',  // Card borders
  gray150: '#eef2fb',  // Light backgrounds
  gray100: '#f0f4fa',  // Table hover
  gray50: '#f8fafd',   // Input backgrounds
  white: '#ffffff',
}
```

**Background Colors**:
```javascript
{
  surface: '#f6f8fc',     // Main page background
  card: '#ffffff',        // Card background
  inputBg: '#f8fafd',     // Input backgrounds
  tableBg: '#f8fafd',     // Table header background
  hoverBg: '#f0f4fa',     // Table row hover
}
```

#### Spacing Scale

Based on 4px increments:
```javascript
{
  0.5: '2px',   // Micro spacing
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
}
```

**Application Guidelines**:
- Card padding: `20-24px` (5-6)
- Section margins: `16-20px` (4-5)
- Form field spacing: `12-16px` (3-4)
- Component gaps: `8-16px` (2-4)
- Table cell padding: `12-16px horizontal, 10-12px vertical` (3-4, 2.5-3)

#### Border Radius

```javascript
{
  sm: '4-6px',   // Small elements, input corners
  md: '6-8px',   // Buttons, inputs
  lg: '8px',     // Cards, modals
  xl: '12px',    // Large cards
  full: '9999px', // Badges, pills
}
```

#### Shadows & Elevation

```javascript
{
  // Subtle elevation
  sm: '0 1px 3px rgba(0,0,0,0.1)',
  
  // Standard elevation
  DEFAULT: '0 2px 8px rgba(13,39,74,0.04)',
  
  // Medium elevation (cards, dropdowns)
  md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  
  // High elevation (modals)
  lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
  
  // Extra high elevation
  '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
}
```

#### Animation & Transition Timing

```javascript
{
  // Duration
  fast: '150ms',
  base: '200ms',
  medium: '300ms',
  slow: '400ms',
  
  // Easing functions
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  
  // Common transitions
  colors: 'background-color 150ms ease-in-out, border-color 150ms ease-in-out, color 150ms ease-in-out',
  all: 'all 200ms ease-in-out',
  transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
}
```

### 2. Component Design Patterns

#### Button Components

**Primary Button**:
```javascript
// Styling
{
  background: '#2d55a0',
  color: 'white',
  padding: '8-10px 12-16px',
  borderRadius: '6-8px',
  fontSize: '12.5-13px',
  fontWeight: 500-600,
  transition: 'background-color 150ms, transform 150ms',
  
  hover: {
    background: '#234690',  // 10-15% darker
  },
  
  active: {
    transform: 'scale(0.98)',
  },
  
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}

// Usage Example
<button className="inline-flex items-center gap-1.5 rounded-lg bg-[#2d55a0] px-4 py-2 text-[12.5px] font-medium text-white hover:bg-[#234690] transition-colors disabled:opacity-50">
  <span className="material-symbols-outlined text-[16px]">add</span>
  New Order
</button>
```

**Secondary Button**:
```javascript
{
  background: '#f8fafd',
  border: '1px solid #c5d3e4/50',
  color: '#374151',
  hover: {
    background: '#f0f4fa',
  },
}

// Usage
<button className="rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-4 py-2 text-[13px] font-medium text-[#374151] hover:bg-[#f0f4fa] transition-colors">
  Cancel
</button>
```

**Icon Button**:
```javascript
{
  width: '32-36px',
  height: '32-36px',
  padding: 0,
  minTouchTarget: '36px',
  
  // Usage
  <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#374151] hover:bg-[#eef2fb] hover:text-[#2d55a0] transition-colors">
    <span className="material-symbols-outlined text-[17px]">edit</span>
  </button>
}
```

**Loading Button**:
```javascript
// Show spinner + disabled state
<button disabled className="inline-flex items-center gap-1.5 ... disabled:opacity-50">
  <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
  Saving...
</button>
```

#### Form Elements

**Text Input**:
```javascript
{
  base: {
    width: '100%',
    background: '#f8fafd',
    border: '1px solid #c5d3e4/50',
    borderRadius: '6-8px',
    padding: '8-10px 12px',
    fontSize: '13px',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
  },
  
  focus: {
    borderColor: '#2d55a0',
    ring: '2px solid rgba(45, 85, 160, 0.1)',
  },
  
  error: {
    borderColor: '#ba1a1a',
  },
  
  disabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    background: '#f3f4f6',
  },
  
  placeholder: {
    color: '#9ca3af',
  },
}

// Usage
<input 
  className="w-full rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] focus:ring-2 focus:ring-[#2d55a0]/10 transition-all placeholder:text-[#9ca3af]"
/>
```

**Select Dropdown**:
```javascript
// Same styling as text input
// Add down arrow icon if needed
<select className={inputStyles}>
  <option value="">Select option</option>
  <option value="1">Option 1</option>
</select>
```

**Textarea**:
```javascript
{
  ...inputBase,
  minHeight: '80-96px',
  resize: 'vertical',
  padding: '10-12px',
}
```

**Form Label**:
```javascript
{
  display: 'block',
  fontSize: '12px',
  fontWeight: 500-600,
  color: '#374151',
  marginBottom: '4-6px',
  
  // Required indicator
  <label className="block text-[12px] font-medium text-[#374151] mb-1">
    Employee <span className="text-[#ba1a1a]">*</span>
  </label>
}
```

**Field Error Message**:
```javascript
<p className="text-[11.5px] text-[#ba1a1a] mt-0.5">This field is required</p>
```

**Search Input with Icon**:
```javascript
<div className="relative">
  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[17px]">search</span>
  <input className="...pl-9..." placeholder="Search..." />
</div>
```

#### Card Components

**Standard Card**:
```javascript
{
  background: 'white',
  border: '1px solid #e2e9f4',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  padding: '20-24px',
}

// Usage
<div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm p-6">
  {/* Card content */}
</div>
```

**Card with Header**:
```javascript
<div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm overflow-hidden">
  {/* Header */}
  <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e9f4]">
    <h2 className="text-[15px] font-semibold text-[#111827]">Card Title</h2>
    <button>Action</button>
  </div>
  
  {/* Body */}
  <div className="px-6 py-5">
    {/* Content */}
  </div>
</div>
```

**Stat Card (KPI)**:
```javascript
<div className="rounded-lg bg-[#f8fafd] border border-[#e2e9f4] px-4 py-3">
  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] mb-0.5">
    Label
  </p>
  <p className="text-[18-24px] font-bold text-[#111827]">
    ₹1,234,567
  </p>
  <p className="text-[11px] text-[#6b7280] mt-1">
    Subtitle
  </p>
</div>
```

**Progress Card** (for target visualization):
```javascript
<div className="rounded-xl border border-[#e2e9f4] bg-white shadow-sm overflow-hidden">
  {/* Color strip indicator */}
  <div className="h-1.5 w-full" style={{ background: progressColor }} />
  
  <div className="px-5 pt-4 pb-5 space-y-4">
    {/* Title row */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#2d55a0] text-[18px]">flag</span>
        <span className="text-[13px] font-semibold text-[#111827]">Title</span>
      </div>
      <StatusBadge />
    </div>
    
    {/* Stats grid */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Stat cards */}
    </div>
    
    {/* Progress bar */}
    <div>
      <div className="w-full h-3 rounded-full bg-[#f0f4fa] overflow-visible relative">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
        {/* Threshold markers */}
      </div>
    </div>
    
    {/* Status message */}
    <div className="flex items-center gap-2 rounded-lg ...">
      <span className="material-symbols-outlined">info</span>
      <span>Message</span>
    </div>
  </div>
</div>
```

#### Table Components

**Table Container**:
```javascript
<div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm overflow-hidden">
  <div className="overflow-x-auto w-full">
    <table className="w-full text-left border-collapse" style={{ minWidth: 800 }}>
      {/* Table content */}
    </table>
  </div>
  
  {/* Optional: Pagination footer */}
  <div className="flex items-center justify-between px-4 py-3 border-t border-[#e2e9f4]">
    {/* Pagination controls */}
  </div>
</div>
```

**Table Header**:
```javascript
<thead>
  <tr className="bg-[#f8fafd] text-[#6b7280] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e2e9f4]">
    <th className="px-4 py-3">Column</th>
    <th className="px-4 py-3 text-right">Numeric</th>
  </tr>
</thead>
```

**Table Body**:
```javascript
<tbody className="text-[13px] text-[#111827] divide-y divide-[#f0f4fa]">
  <tr className="hover:bg-[#f8fafd] transition-colors">
    <td className="px-4 py-3">Cell content</td>
    <td className="px-4 py-3 text-right font-semibold text-[#2d55a0]">
      ₹1,234
    </td>
  </tr>
</tbody>
```

**Empty State**:
```javascript
<tr>
  <td colSpan={columns} className="py-14 text-center">
    <div className="flex flex-col items-center gap-2">
      <span className="material-symbols-outlined text-[#c5d3e4] text-[36px]">
        inventory_2
      </span>
      <p className="text-[13px] text-[#374151]">
        No data available
      </p>
    </div>
  </td>
</tr>
```

**Sticky Header** (for scrollable tables):
```javascript
<thead className="sticky top-0 z-10 bg-[#f8fafd]">
  {/* Headers */}
</thead>
```

#### Badge Components

**Status Badge**:
```javascript
const STATUS_STYLES = {
  active: 'bg-[#dcfce7] text-[#166534]',
  inactive: 'bg-[#f3f4f6] text-[#6b7280]',
  draft: 'bg-[#fef9c3] text-[#854d0e]',
  approved: 'bg-[#dcfce7] text-[#166534]',
  rejected: 'bg-[#ffdad6] text-[#ba1a1a]',
  frozen: 'bg-[#e0e7ff] text-[#3730a3]',
  submitted: 'bg-[#dbe5f8] text-[#1e3a8a]',
  achieved: 'bg-[#dbe5f8] text-[#1e3a8a]',
};

<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium capitalize ${STATUS_STYLES[status]}`}>
  {status}
</span>
```

**Count Badge**:
```javascript
<span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#dbe5f8] text-[11px] font-medium text-[#374151] border border-[#c5d3e4]/30">
  {count} Total
</span>
```

**Info Badge** (for financial year, etc.):
```javascript
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#f0f4fa] text-[12px] font-medium text-[#374151]">
  FY 2026-27
</span>
```

#### Modal Components

**Modal Overlay**:
```javascript
<div 
  className="fixed inset-0 z-50 flex items-center justify-center p-4"
  style={{ background: 'rgba(15,32,68,0.30-0.40)', backdropFilter: 'blur(4-8px)' }}
>
  {/* Modal content */}
</div>
```

**Modal Container**:
```javascript
<div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
  {/* Header */}
  <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e9f4]">
    <div>
      <h2 className="text-[15-16px] font-semibold text-[#111827]">Modal Title</h2>
      <p className="text-[12px] text-[#6b7280] mt-0.5">Description</p>
    </div>
    <button className="p-1.5 rounded-lg text-[#6b7280] hover:bg-[#f3f6fb] transition-colors">
      <span className="material-symbols-outlined text-[20px]">close</span>
    </button>
  </div>
  
  {/* Body (scrollable) */}
  <form className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
    {/* Form fields */}
  </form>
  
  {/* Footer (sticky) */}
  <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e2e9f4]">
    <button type="button" className="secondary-btn">Cancel</button>
    <button type="submit" className="primary-btn">Save</button>
  </div>
</div>
```

**Modal Animation** (entry):
```css
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

animation: modalEnter 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

#### Alert Components

**Success Alert**:
```javascript
<div className="flex items-center gap-2 rounded-lg border border-[#dcfce7] bg-[#dcfce7]/60 px-4 py-3">
  <span className="material-symbols-outlined text-[#166534] text-[18px]">check_circle</span>
  <span className="text-[13px] text-[#166534]">Success message</span>
</div>
```

**Error Alert**:
```javascript
<div className="flex items-center justify-between gap-3 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3">
  <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">error</span>
    <span className="text-[13px] text-[#ba1a1a]">Error message</span>
  </div>
  <button className="text-[#ba1a1a]">
    <span className="material-symbols-outlined text-[18px]">close</span>
  </button>
</div>
```

**Warning Alert**:
```javascript
<div className="flex items-center gap-2 rounded-lg bg-[#fffbeb] border border-[#fde68a] px-3 py-2">
  <span className="material-symbols-outlined text-[#d97706] text-[16px]">info</span>
  <span className="text-[12.5px] text-[#92400e]">Warning message</span>
</div>
```

**Info Alert**:
```javascript
<div className="flex items-center gap-2 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-2">
  <span className="material-symbols-outlined text-[#166534] text-[16px]">check_circle</span>
  <span className="text-[12.5px] text-[#166534]">Info message</span>
</div>
```

#### Loading States

**Full Page Loading**:
```javascript
<div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 py-16 flex flex-col items-center gap-2">
  <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">
    progress_activity
  </span>
  <span className="text-[13px] text-[#374151]">Loading...</span>
</div>
```

**Button Loading**:
```javascript
<button disabled className="... disabled:opacity-50">
  <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
  Saving...
</button>
```

**Skeleton Screen** (optional for progressive loading):
```javascript
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-[#e2e9f4] rounded w-3/4" />
  <div className="h-4 bg-[#e2e9f4] rounded w-1/2" />
</div>
```

#### Pagination

**Pagination Bar**:
```javascript
<div className="flex items-center justify-between px-4 py-3 border-t border-[#e2e9f4] text-[12.5px] text-[#374151]">
  {/* Left: Info */}
  <span>Showing 1–10 of 100</span>
  
  {/* Right: Controls */}
  <div className="flex items-center gap-1">
    <button className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[#c5d3e4]/50 text-[#374151] hover:bg-[#f0f4fa] disabled:opacity-40 disabled:cursor-not-allowed">
      <span className="material-symbols-outlined text-[15px]">first_page</span>
    </button>
    <button className="...">
      <span className="material-symbols-outlined text-[15px]">chevron_left</span>
    </button>
    <span className="px-2">Page 1 of 10</span>
    <button className="...">
      <span className="material-symbols-outlined text-[15px]">chevron_right</span>
    </button>
    <button className="...">
      <span className="material-symbols-outlined text-[15px]">last_page</span>
    </button>
  </div>
</div>
```

#### Dropdown Menu

**Action Dropdown** (for status changes, etc.):
```javascript
<div className="relative inline-block">
  <button onClick={toggle} className="flex items-center gap-1">
    <StatusBadge />
    <span className="material-symbols-outlined text-[13px]">expand_more</span>
  </button>
  
  {open && (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-10" onClick={close} />
      
      {/* Menu */}
      <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-lg border border-[#e2e9f4] shadow-lg py-1 min-w-[120px]">
        <button className="w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-[#f3f6fb] flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">check</span>
          Option
        </button>
      </div>
    </>
  )}
</div>
```

### 3. Page Layout Patterns

#### Page Header Pattern

```javascript
<div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
  {/* Left: Title + description */}
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-2.5">
      <h1 
        className="font-semibold text-[20px] text-[#111827]"
        style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
      >
        Page Title
      </h1>
      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#dbe5f8] text-[11px] font-medium text-[#374151] border border-[#c5d3e4]/30">
        {count} Total
      </span>
    </div>
    <p className="text-[12.5px] text-[#374151]">
      Brief description of this page.
    </p>
  </div>
  
  {/* Right: Actions */}
  <button className="primary-btn shrink-0">
    <span className="material-symbols-outlined text-[16px]">add</span>
    New Item
  </button>
</div>
```

#### Filter Bar Pattern

```javascript
<div className="bg-white rounded-xl border border-[#e2e9f4] px-4 py-3 mb-4 flex flex-wrap items-center gap-3">
  {/* Search */}
  <div className="relative flex-1 min-w-[180px]">
    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[17px]">
      search
    </span>
    <input 
      placeholder="Search..."
      className="w-full rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] py-2 pl-9 pr-3 text-[13px] ..."
    />
  </div>
  
  {/* Filters */}
  <select className="...">
    <option value="">All Statuses</option>
  </select>
  
  <select className="...">
    <option value="">All Types</option>
  </select>
  
  {/* Page size */}
  <label className="flex items-center gap-1.5 text-[12px] text-[#374151] whitespace-nowrap ml-auto">
    Show
    <select className="...">
      <option>10</option>
      <option>25</option>
      <option>50</option>
    </select>
  </label>
</div>
```

#### Employee/Entity Info Strip

```javascript
<div className="mb-3 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#eef2fb] border border-[#c5d3e4]/40">
  {/* Avatar */}
  <div className="w-8 h-8 rounded-full bg-[#2d55a0] flex items-center justify-center text-[12px] font-bold text-white shrink-0">
    {initial}
  </div>
  
  {/* Info */}
  <div className="min-w-0 flex-1">
    <span className="text-[13px] font-semibold text-[#111827]">{name}</span>
    <span className="ml-2 text-[11px] font-mono text-[#2d55a0] bg-[#dbe5f8] px-1.5 py-0.5 rounded">
      {id}
    </span>
    <span className="ml-2 text-[12px] text-[#6b7280]">{role}</span>
  </div>
  
  {/* Count */}
  <div className="text-[12px] text-[#374151] shrink-0">
    {count} items
  </div>
</div>
```

## Data Models

### Component Props Interfaces

```typescript
// Button Props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: string; // Material Symbol name
  children: React.ReactNode;
  onClick?: () => void;
}

// Input Props
interface InputProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'email' | 'date' | 'password';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  icon?: string;
}

// Badge Props
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'draft' | 'approved' | 'rejected' | 'frozen' | 'submitted' | 'achieved';
  size?: 'sm' | 'md';
}

// Modal Props
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  footer?: React.ReactNode;
}

// Alert Props
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

// Table Props
interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  stickyHeader?: boolean;
}

// Pagination Props
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}
```

## Testing Strategy

### Test Coverage

Given that this is primarily a UI redesign focused on visual styling and design system implementation, the testing strategy will focus on:

1. **Example-Based Unit Tests**
   - Component rendering tests (snapshots)
   - Prop validation
   - Event handlers
   - Conditional rendering
   - Accessibility attributes

2. **Integration Tests**
   - Form submission flows
   - Modal interactions
   - Pagination behavior
   - Filter and search functionality
   - Data loading states

3. **Visual Regression Tests**
   - Screenshot comparisons for key components
   - Responsive layout verification
   - Theme consistency checks

4. **Accessibility Tests**
   - Keyboard navigation
   - Screen reader compatibility
   - ARIA attributes
   - Color contrast ratios
   - Focus management

**Property-based testing is NOT appropriate for this redesign** because:
- This is purely a visual/styling update, not new business logic
- No universal properties exist for UI rendering
- Component appearance is deterministic based on props
- Visual validation requires human judgment or snapshot testing

### Test Examples

```javascript
// Example-based unit test for Button component
describe('Button Component', () => {
  it('renders primary button with correct styles', () => {
    const { container } = render(<Button variant="primary">Click me</Button>);
    expect(container.querySelector('button')).toHaveClass('bg-[#2d55a0]');
  });
  
  it('shows loading state when loading prop is true', () => {
    const { getByText } = render(<Button loading>Save</Button>);
    expect(getByText('progress_activity')).toBeInTheDocument();
  });
  
  it('is disabled when disabled prop is true', () => {
    const { container } = render(<Button disabled>Click</Button>);
    expect(container.querySelector('button')).toBeDisabled();
  });
});

// Example-based test for StatusBadge
describe('StatusBadge', () => {
  it('renders active status with green styling', () => {
    const { container } = render(<StatusBadge status="active" />);
    expect(container.querySelector('span')).toHaveClass('bg-[#dcfce7]');
    expect(container.querySelector('span')).toHaveClass('text-[#166534]');
  });
  
  it('renders frozen status with indigo styling', () => {
    const { container } = render(<StatusBadge status="frozen" />);
    expect(container.querySelector('span')).toHaveClass('bg-[#e0e7ff]');
    expect(container.querySelector('span')).toHaveClass('text-[#3730a3]');
  });
});

// Integration test for modal interaction
describe('SchemeModal', () => {
  it('opens modal when trigger is clicked', () => {
    const { getByText, queryByRole } = render(<IncentiveSchemes />);
    
    expect(queryByRole('dialog')).not.toBeInTheDocument();
    
    fireEvent.click(getByText('New Scheme'));
    
    expect(queryByRole('dialog')).toBeInTheDocument();
  });
  
  it('closes modal on cancel', () => {
    const onClose = jest.fn();
    const { getByText } = render(<SchemeModal isOpen onClose={onClose} />);
    
    fireEvent.click(getByText('Cancel'));
    
    expect(onClose).toHaveBeenCalled();
  });
});

// Accessibility test
describe('Form Accessibility', () => {
  it('associates labels with inputs', () => {
    const { getByLabelText } = render(<OrderForm />);
    expect(getByLabelText('Invoice No')).toBeInTheDocument();
    expect(getByLabelText('PO Number *')).toBeInTheDocument();
  });
  
  it('shows error messages with proper aria attributes', () => {
    const { getByRole } = render(<Input error="Required" />);
    const input = getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
```

## Implementation Approach

### Phase 1: Foundation Layer (Week 1)

**Goal**: Establish design system tokens and core utilities

1. **Create Design Tokens File** (`src/styles/designTokens.js` or CSS variables)
   ```javascript
   export const tokens = {
     colors: { ... },
     typography: { ... },
     spacing: { ... },
     shadows: { ... },
     transitions: { ... },
   };
   ```

2. **Update Tailwind Config** (`tailwind.config.js`)
   - Add custom colors
   - Define spacing scale
   - Configure typography plugin
   - Add custom shadows
   - Set up transitions

3. **Create Global Styles** (`src/styles/incentives.css`)
   - CSS custom properties for tokens
   - Base element styles
   - Utility classes for common patterns

4. **Document Design System**
   - Create component library/style guide
   - Document usage patterns
   - Provide code examples

### Phase 2: Component Library (Week 2)

**Goal**: Build reusable, styled components

1. **Core Components** (`src/components/incentives/ui/`)
   - Button (primary, secondary, icon, ghost)
   - Input (text, number, date, select, textarea)
   - Badge (status, count, info)
   - Card (standard, stat, progress)
   - Alert (success, error, warning, info)
   - Modal (standard, form)
   - Loading (spinner, skeleton)

2. **Component Testing**
   - Unit tests for each component
   - Accessibility tests
   - Snapshot tests

3. **Storybook Setup** (Optional but recommended)
   - Create stories for each component
   - Document props and variants
   - Enable interactive testing

### Phase 3: Panel Implementation (Weeks 3-4)

**Goal**: Apply redesign to each of the 5 panels

#### Panel 1: IncentiveOrders (Week 3, Day 1-2)

**Changes**:
1. Update page header styling
2. Redesign target progress card
   - Add colored top strip indicator
   - Improve stat card grid
   - Enhance progress bar visualization
   - Refine status messages
3. Restyle table
   - Update header styling
   - Improve row hover states
   - Enhance pagination
4. Refine search and filter bar
5. Polish loading and empty states

**Files to Modify**:
- `src/pages/OBSheetPanel/incentives/IncentiveOrders.jsx`

#### Panel 2: OrderForm (Week 3, Day 3-4)

**Changes**:
1. Update page header with back button
2. Redesign form layout
   - Improve field spacing
   - Add consistent labels
   - Enhance validation messages
3. Refine frozen order notice
4. Improve incentive calculation display
   - Better visual hierarchy
   - Clearer rule breakdown
   - Enhanced formatting
5. Polish action buttons
6. Improve alert styling

**Files to Modify**:
- `src/pages/OBSheetPanel/incentives/OrderForm.jsx`

#### Panel 3: IncentiveSchemes (Week 3, Day 5)

**Changes**:
1. Update page header
2. Restyle table
   - Improve column layout
   - Better date formatting
   - Enhanced action buttons
3. Redesign scheme modal
   - Improve header/footer separation
   - Better form field layout
   - Enhanced validation display
4. Polish loading states

**Files to Modify**:
- `src/pages/OBSheetPanel/incentives/IncentiveSchemes.jsx`

#### Panel 4: EmployeeTargets (Week 4, Day 1-2)

**Changes**:
1. Update page header
2. Redesign stats strip
   - Better stat card styling
   - Improved icon usage
   - Enhanced visual hierarchy
3. Restyle table
   - Better employee cell layout (avatar + info)
   - Improved scheme display
   - Enhanced status dropdown
4. Refine filter bar
5. Redesign target modal
   - Better form layout
   - Improved field grouping
   - Enhanced validation

**Files to Modify**:
- `src/pages/OBSheetPanel/incentives/EmployeeTargets.jsx`

#### Panel 5: EmployeeOrdersPanel (Week 4, Day 3-4)

**Changes**:
1. Update page header
2. Redesign controls bar
   - Better employee selector
   - Improved row count input
   - Enhanced freeze button
3. Add employee info strip
4. Restyle table
   - Better checkbox alignment
   - Improve frozen row indication
   - Enhanced totals footer
5. Improve selection feedback
6. Polish freeze feedback messages

**Files to Modify**:
- `src/pages/OBSheetPanel/incentives/EmployeeOrdersPanel.jsx`

### Phase 4: Polish & Refinement (Week 5)

**Goal**: Final touches and cross-panel consistency

1. **Visual Consistency Audit**
   - Verify color usage across panels
   - Check typography consistency
   - Validate spacing adherence
   - Ensure icon consistency

2. **Responsive Design Testing**
   - Test at all breakpoints (320px, 640px, 768px, 1024px, 1280px)
   - Fix mobile layout issues
   - Verify touch targets (min 36px)
   - Test table scrolling

3. **Accessibility Audit**
   - Keyboard navigation testing
   - Screen reader testing
   - Color contrast verification (WCAG AA)
   - Focus indicator visibility
   - ARIA label completeness

4. **Animation & Interaction Polish**
   - Verify transition smoothness
   - Check loading states
   - Test modal animations
   - Validate hover states

5. **Performance Optimization**
   - Remove unused styles
   - Optimize component re-renders
   - Test with large datasets
   - Verify animation performance

6. **Documentation**
   - Update design system docs
   - Document component usage
   - Create migration guide
   - Add code examples

### Phase 5: Testing & QA (Week 6)

**Goal**: Comprehensive testing and bug fixes

1. **Unit Testing**
   - Achieve 80%+ coverage for new components
   - Test all component variants
   - Verify prop handling

2. **Integration Testing**
   - Test complete user flows
   - Verify form submissions
   - Check modal interactions
   - Test pagination

3. **Visual Regression Testing**
   - Capture screenshots of all panels
   - Compare with baseline
   - Document intentional changes

4. **Cross-Browser Testing**
   - Chrome, Firefox, Safari, Edge
   - Test on Windows, macOS, iOS, Android

5. **Accessibility Testing**
   - Automated testing (axe-core, Lighthouse)
   - Manual keyboard navigation
   - Screen reader testing (NVDA, JAWS, VoiceOver)

6. **User Acceptance Testing**
   - Demo to stakeholders
   - Gather feedback
   - Prioritize fixes
   - Implement refinements

### Implementation Guidelines

**Code Style**:
- Use Tailwind utility classes for styling
- Keep inline styles minimal (only for dynamic values)
- Extract repeated patterns into reusable components
- Use semantic HTML elements
- Add proper ARIA labels
- Include TypeScript prop types (if using TS)

**Component Organization**:
```
src/components/incentives/
├── ui/              # Reusable UI components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Badge.jsx
│   ├── Card.jsx
│   ├── Modal.jsx
│   ├── Alert.jsx
│   └── Table.jsx
├── layout/          # Layout components
│   ├── PageHeader.jsx
│   ├── FilterBar.jsx
│   └── Pagination.jsx
└── shared/          # Shared utilities
    ├── StatusBadge.jsx
    ├── LoadingSpinner.jsx
    └── EmptyState.jsx
```

**Naming Conventions**:
- Components: PascalCase (`StatusBadge`, `FilterBar`)
- Files: Same as component name
- CSS classes: Use Tailwind utilities
- Props: camelCase
- Constants: UPPER_SNAKE_CASE

**Responsive Strategy**:
- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Stack layouts vertically on mobile
- Hide non-essential columns in tables
- Use horizontal scroll for wide tables
- Adjust padding/spacing for smaller screens

**Accessibility Checklist**:
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible (2px outline, 10% opacity ring)
- [ ] Color is not the only means of conveying information
- [ ] Contrast ratios meet WCAG AA (4.5:1 for normal text, 3:1 for large)
- [ ] Form inputs have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Modals trap focus and close with Escape
- [ ] ARIA labels for icon-only buttons
- [ ] Skip links for keyboard navigation
- [ ] Respect prefers-reduced-motion

## Error Handling

### Form Validation

**Field-Level Errors**:
```javascript
const [errors, setErrors] = useState({});

function validate() {
  const e = {};
  if (!form.field.trim()) e.field = "Required";
  if (form.amount < 0) e.amount = "Must be positive";
  return e;
}

// Display
{errors.field && (
  <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{errors.field}</p>
)}
```

**Form-Level Errors**:
```javascript
{saveError && (
  <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3">
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">error</span>
      <span className="text-[13px] text-[#ba1a1a]">{saveError}</span>
    </div>
    <button onClick={() => setSaveError(null)}>
      <span className="material-symbols-outlined text-[18px]">close</span>
    </button>
  </div>
)}
```

### API Error Handling

**Network Errors**:
```javascript
try {
  const data = await fetchData();
  setData(data);
} catch (err) {
  setError(err.message ?? "Failed to load data");
}

// Display with retry
{error && (
  <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3">
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">error</span>
      <span className="text-[13px] text-[#ba1a1a]">{error}</span>
    </div>
    <button onClick={retry} className="text-[12px] font-medium text-[#111827] underline">
      Retry
    </button>
  </div>
)}
```

### Loading States

**Page-Level Loading**:
```javascript
{loading ? (
  <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 py-16 flex flex-col items-center gap-2">
    <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">
      progress_activity
    </span>
    <span className="text-[13px] text-[#374151]">Loading...</span>
  </div>
) : (
  // Content
)}
```

**Button Loading**:
```javascript
<button disabled={loading} className="... disabled:opacity-50">
  {loading && <span className="material-symbols-outlined animate-spin">progress_activity</span>}
  {loading ? 'Saving...' : 'Save'}
</button>
```

### Empty States

**No Data**:
```javascript
{data.length === 0 ? (
  <tr>
    <td colSpan={columns} className="py-14 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="material-symbols-outlined text-[#c5d3e4] text-[36px]">
          inventory_2
        </span>
        <p className="text-[13px] text-[#374151]">
          No items found. Click "New Item" to add one.
        </p>
      </div>
    </td>
  </tr>
) : (
  // Data rows
)}
```

**Filtered Empty State**:
```javascript
<p className="text-[13px] text-[#374151]">
  {hasFilters 
    ? "No items match the current filters." 
    : "No items found."}
</p>
```

## Correctness Properties

*This section is omitted because property-based testing does not apply to UI redesign work. The redesign involves visual styling, component appearance, and user interface refinement, which are best validated through example-based unit tests, visual regression tests, and manual accessibility audits rather than property-based testing.*

**Testing approach for this redesign**:
- **Example-based unit tests**: Component rendering, prop validation, event handlers
- **Snapshot tests**: Visual consistency across component variants
- **Accessibility tests**: Keyboard navigation, screen reader compatibility, ARIA attributes
- **Visual regression tests**: Screenshot comparison for layout verification
- **Integration tests**: User flows, form submissions, modal interactions

## Appendix

### Design System Checklist

**Foundation**:
- [ ] Typography system documented
- [ ] Color palette defined with semantic meanings
- [ ] Spacing scale established
- [ ] Shadow/elevation system created
- [ ] Animation timing functions specified

**Components**:
- [ ] Button variants designed (primary, secondary, ghost, icon)
- [ ] Form elements styled (input, select, textarea, checkbox, radio)
- [ ] Card patterns created (standard, stat, progress)
- [ ] Table styling defined (header, body, footer, pagination)
- [ ] Badge variants designed (status, count, info)
- [ ] Modal pattern established (header, body, footer)
- [ ] Alert variants created (success, error, warning, info)
- [ ] Loading states designed (page, button, skeleton)

**Patterns**:
- [ ] Page header pattern documented
- [ ] Filter bar pattern defined
- [ ] Info strip pattern created
- [ ] Empty state pattern established
- [ ] Pagination pattern documented

**Accessibility**:
- [ ] Keyboard navigation verified
- [ ] Focus indicators visible
- [ ] Color contrast ratios checked (WCAG AA)
- [ ] ARIA labels added where needed
- [ ] Screen reader compatibility tested
- [ ] Touch targets meet minimum size (36px)

### Migration Guide

**For Developers Implementing the Redesign**:

1. **Start with the design tokens**
   - Review the typography, color, and spacing definitions
   - Update Tailwind config if needed
   - Create CSS custom properties for runtime values

2. **Build the component library first**
   - Create reusable UI components before modifying panels
   - Test each component in isolation
   - Document usage with examples

3. **Apply panel-by-panel**
   - Don't try to redesign all panels at once
   - Follow the implementation order (IncentiveOrders → OrderForm → IncentiveSchemes → EmployeeTargets → EmployeeOrdersPanel)
   - Test thoroughly after each panel

4. **Maintain functionality**
   - This is a visual redesign, not a refactor
   - Keep all existing features working
   - Don't change component logic unless necessary for styling

5. **Use the design document as reference**
   - Copy code examples directly when applicable
   - Adapt to specific needs while maintaining consistency
   - Document deviations from the spec

### References

- **LoginPage** (`src/pages/LoginPage.jsx`) — Primary design reference
- **Current Panels** (`src/pages/OBSheetPanel/incentives/`) — Existing implementations
- **Global Styles** (`src/index.css`) — Current styling patterns
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Material Symbols**: https://fonts.google.com/icons
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
