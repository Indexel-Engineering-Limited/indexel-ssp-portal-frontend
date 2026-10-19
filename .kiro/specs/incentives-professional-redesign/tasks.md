# Implementation Plan: Incentives Professional Redesign

## Overview

This plan implements a comprehensive visual redesign of the incentives module, establishing a professional design system based on the LoginPage aesthetic. The implementation covers typography refinement, color palette enhancement, consistent spacing, polished component styling, and smooth interactions across all five incentive management panels (IncentiveOrders, OrderForm, IncentiveSchemes, EmployeeTargets, EmployeeOrdersPanel).

The redesign is purely visual - all existing functionality remains unchanged. The focus is on creating a cohesive, enterprise-grade user interface through systematic application of design tokens, component patterns, and layout improvements.

## Tasks

- [ ] 1. Establish Design System Foundation
  - [~] 1.1 Create design tokens configuration file
    - Create `src/styles/designTokens.js` with complete token definitions
    - Define typography system (font families, sizes, weights, line heights, letter spacing)
    - Define color palette (brand colors, semantic colors, neutral grays, backgrounds)
    - Define spacing scale (4px increments from 2px to 64px)
    - Define border radius values (sm, md, lg, xl, full)
    - Define shadow and elevation system
    - Define animation timing functions and durations
    - Export all tokens as JavaScript constants for use in components
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.5, 2.6, 3.1, 9.2_
  
  - [ ] 1.2 Update Tailwind configuration with custom design tokens
    - Modify `tailwind.config.js` to extend theme with custom colors from design system
    - Add custom spacing values to match the 4px-based scale
    - Configure typography plugin with custom font families (Manrope, Hanken Grotesk)
    - Add custom box shadow definitions matching the elevation system
    - Configure transition duration and timing function utilities
    - Add custom border radius values
    - Ensure all design tokens are available as Tailwind utility classes
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.7, 9.1, 9.2_
  
  - [ ] 1.3 Create global incentives styles file
    - Create `src/styles/incentives.css` with CSS custom properties for runtime values
    - Define base styles for common HTML elements within incentives module
    - Create utility classes for frequently used design patterns
    - Add animation keyframes for modal entry, loading spinners, etc.
    - Include print-specific styles for better output
    - Document CSS custom properties usage in comments
    - _Requirements: 1.1, 1.2, 1.3, 9.4, 15.7_

- [ ] 2. Build Reusable UI Component Library
  - [ ] 2.1 Create Button component variants
    - Create `src/components/incentives/ui/Button.jsx`
    - Implement primary button variant (solid #2d55a0 background, white text)
    - Implement secondary button variant (border, transparent background)
    - Implement ghost button variant (no border, hover background)
    - Implement icon-only button variant (32-36px square)
    - Add loading state with spinner animation and disabled appearance
    - Add disabled state with 40-50% opacity
    - Implement hover effects (darken by 10-15%, transition 150ms)
    - Implement active state with scale(0.98) transform
    - Add icon support with configurable left/right positioning and 4-8px gap
    - Ensure minimum height of 36px for touch targets
    - Add proper TypeScript prop types or PropTypes validation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 9.1, 9.2_
  
  - [ ] 2.2 Create Input component with variants
    - Create `src/components/incentives/ui/Input.jsx`
    - Implement text input with #f8fafd background and #c5d3e4/50 border
    - Add focus state with #2d55a0 border and 2px ring at 10% opacity
    - Add error state with #ba1a1a border color
    - Add disabled state with 60% opacity and not-allowed cursor
    - Implement icon support (left-aligned search icon, calendar icon, etc.)
    - Add label component with 12px size, 500 weight, #374151 color
    - Add required indicator with red asterisk
    - Add error message display below input (11.5px, #ba1a1a)
    - Style placeholder text with #9ca3af color
    - Apply 150ms transition to border-color and box-shadow
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 6.7, 6.8, 9.1, 9.5_
  
  - [ ] 2.3 Create Select and Textarea components
    - Create `src/components/incentives/ui/Select.jsx` with same styling as Input
    - Add dropdown arrow icon if needed
    - Create `src/components/incentives/ui/Textarea.jsx`
    - Set minimum height to 80-96px with vertical resize
    - Apply consistent padding (10-12px) and styling from Input component
    - Ensure focus, error, and disabled states match Input component
    - _Requirements: 6.1, 6.2, 6.4, 6.7_
  
  - [ ] 2.4 Create StatusBadge component with all status variants
    - Create `src/components/incentives/ui/StatusBadge.jsx`
    - Define STATUS_STYLES constant with background and text colors for each status
    - Implement status variants: active, inactive, draft, approved, rejected, frozen, submitted, achieved
    - Use rounded-full design (9999px border radius)
    - Apply 11.5px font size with 500 font weight
    - Use px-2.5 py-0.5 padding
    - Add capitalize class for consistent text display
    - Ensure all color combinations meet WCAG AA contrast ratios
    - Add optional icon support for specific statuses (check for approved, lock for frozen)
    - _Requirements: 2.2, 2.4, 2.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [ ] 2.5 Create Card component variants
    - Create `src/components/incentives/ui/Card.jsx`
    - Implement standard card (white background, #e2e9f4 border, 12px rounded, subtle shadow)
    - Implement card with header variant (separated header section with border-bottom)
    - Implement stat card variant (for KPI display with large numbers)
    - Apply consistent padding (20-24px for body)
    - Add optional hover effects for interactive cards (shadow increase, subtle scale)
    - Ensure proper spacing between card sections
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [ ] 2.6 Create Modal component with animations
    - Create `src/components/incentives/ui/Modal.jsx`
    - Implement backdrop overlay with blur (4-8px) and dark background (rgba(15,32,68,0.35))
    - Center modal with max-width constraint (480-600px for forms)
    - Create modal header with title, description, and close button
    - Create scrollable body section (overflow-y-auto)
    - Create sticky footer with action buttons (border-top separation)
    - Add modal entry animation (fade-in + scale 0.95 to 1, 200ms)
    - Implement focus trap within modal
    - Prevent body scroll when modal is open
    - Add ESC key handler to close modal
    - Apply large shadow (0 20px 25px rgba(0,0,0,0.15))
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 9.4, 19.3_
  
  - [ ] 2.7 Create Alert component with severity variants
    - Create `src/components/incentives/ui/Alert.jsx`
    - Implement success alert (green theme: #dcfce7 bg, #166534 text, check_circle icon)
    - Implement error alert (red theme: #ffdad6 bg, #ba1a1a text, error icon)
    - Implement warning alert (amber theme: #fffbeb bg, #d97706 text, info icon)
    - Implement info alert (blue theme: #dbe5f8 bg, #1e3a8a text, info icon)
    - Add optional dismiss button with close icon
    - Apply 12-16px padding and 8px border radius
    - Include appropriate border colors matching background
    - Position icon on the left with 2-3 gap from message text
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_
  
  - [ ] 2.8 Create Table component with styling
    - Create `src/components/incentives/ui/Table.jsx`
    - Style table container with white background, #e2e9f4 border, rounded corners, shadow
    - Style table header with #f8fafd background, 11px uppercase text, semibold weight, #6b7280 color
    - Implement alternating row styling with hover effect (#f8fafd or #f0f4fa)
    - Apply consistent cell padding (12-16px horizontal, 10-12px vertical)
    - Add support for right-aligned numeric columns
    - Implement sticky header option for scrollable tables
    - Add horizontal scroll support for narrow viewports
    - Create pagination footer component
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_
  
  - [ ] 2.9 Create Loading and EmptyState components
    - Create `src/components/incentives/ui/LoadingSpinner.jsx`
    - Implement centered spinner with rotating progress_activity icon (#a6bcee color, 28px size)
    - Add descriptive loading text below spinner (13px, #374151)
    - Create button loading variant (inline spinner with text)
    - Create `src/components/incentives/ui/EmptyState.jsx`
    - Display centered large icon (32-48px, #c5d3e4 color)
    - Add descriptive message text (13px, #374151)
    - Add optional suggested action button
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  
  - [ ] 2.10 Create Pagination component
    - Create `src/components/incentives/ui/Pagination.jsx`
    - Display page information text (showing X-Y of Z, 12.5px, #374151)
    - Create first, previous, next, last icon buttons (7x7 size, bordered)
    - Show current page indicator with distinct styling
    - Implement disabled states for boundary buttons (40% opacity)
    - Add page size selector dropdown
    - Apply consistent spacing (8-12px between elements)
    - Add border-top to separate from table content
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

- [ ] 3. Checkpoint - Component Library Validation
  - Ensure all components render correctly in isolation
  - Verify design token usage is consistent across all components
  - Test component variants and props
  - Ensure all tests pass, ask the user if questions arise

- [ ] 4. Redesign IncentiveOrders Panel
  - [ ] 4.1 Update IncentiveOrders page header and layout
    - Modify `src/pages/OBSheetPanel/incentives/IncentiveOrders.jsx`
    - Replace page header with new PageHeader pattern (Hanken Grotesk font, 20px size, #111827 color)
    - Add count badge next to title showing total orders
    - Add brief description text below title (12.5px, #374151)
    - Position "New Order" button with primary button styling
    - Apply proper spacing between header and content (mb-5)
    - _Requirements: 1.1, 1.2, 1.3, 3.2, 7.1, 7.10_
  
  - [ ] 4.2 Redesign target progress card in IncentiveOrders
    - Update target progress card with colored top strip indicator
    - Add color-coded strip based on achievement level (green/amber/red, h-1.5 height)
    - Improve title row with flag icon and status badge
    - Redesign stats grid with 2-4 columns (responsive)
    - Create individual stat cards with small labels (10.5px uppercase, tracking-wider)
    - Display large values (18-24px bold) with proper currency formatting (₹ symbol)
    - Enhance progress bar with smooth fill, rounded ends, 3 height
    - Add threshold markers on progress bar for achievement levels
    - Show status message with appropriate icon and color-coded background
    - Apply smooth transition to progress bar width (duration-700)
    - _Requirements: 1.1, 1.2, 2.5, 3.2, 4.1, 4.2, 4.4, 9.1, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [ ] 4.3 Restyle IncentiveOrders table
    - Update table container with new Card styling (white bg, border, shadow)
    - Apply new table header styling (#f8fafd bg, uppercase 11px, semibold, #6b7280)
    - Update table body with 13px text, #111827 color
    - Add hover effect to table rows (#f8fafd background, transition-colors)
    - Apply consistent cell padding (px-4 py-3)
    - Right-align numeric columns (invoice amount, incentive amount)
    - Style numeric values with semibold font and #2d55a0 color
    - Replace status display with StatusBadge component
    - Update pagination with new Pagination component
    - _Requirements: 2.1, 2.2, 3.2, 4.1, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 8.3, 17.1-17.7_
  
  - [ ] 4.4 Refine search and filter bar in IncentiveOrders
    - Create filter bar with white background, border, rounded corners (px-4 py-3)
    - Add search input with left-aligned search icon (17px, #9ca3af)
    - Style search input with new Input component styling
    - Update status filter dropdown with new Select styling
    - Add page size selector with label and dropdown
    - Apply consistent spacing between filter elements (gap-3)
    - Make filter bar responsive (flex-wrap)
    - _Requirements: 6.1, 6.2, 6.6, 16.1, 16.2, 16.3, 16.4_
  
  - [ ] 4.5 Polish loading and empty states in IncentiveOrders
    - Replace loading state with new LoadingSpinner component
    - Update empty state with EmptyState component (inventory_2 icon, descriptive message)
    - Add appropriate icons and styling for no data scenario
    - Ensure loading spinner is centered and visually prominent
    - _Requirements: 13.1, 13.2, 13.3, 13.7_

- [ ] 5. Redesign OrderForm Panel
  - [ ] 5.1 Update OrderForm page header with back button
    - Modify `src/pages/OBSheetPanel/incentives/OrderForm.jsx`
    - Add back button with arrow icon to header (icon button variant)
    - Update page title styling (20px Hanken Grotesk, semibold)
    - Display current mode (New Order / Edit Order) with appropriate styling
    - Add form description text if needed
    - Apply proper header spacing and layout
    - _Requirements: 1.1, 1.2, 7.3, 11.3, 11.7_
  
  - [ ] 5.2 Redesign OrderForm layout and field styling
    - Update all form fields to use new Input component
    - Apply consistent field spacing (space-y-4, 12-16px vertical gap)
    - Style all labels with 12px font, 500 weight, #374151 color
    - Add required indicators (red asterisk) to mandatory fields
    - Update select dropdowns (employee, scheme) with new Select styling
    - Style date and number inputs with consistent Input styling
    - Group related fields visually with proper spacing
    - Add validation error display with field-level error messages
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.8, 6.9, 14.8_
  
  - [ ] 5.3 Refine frozen order notice in OrderForm
    - Create frozen order alert using Alert component (info variant)
    - Add lock icon with indigo theme (#e0e7ff bg, #3730a3 text)
    - Display clear message about frozen status
    - Position notice prominently above form or at top of page
    - Apply appropriate padding and rounded corners
    - _Requirements: 2.2, 8.7, 14.5_
  
  - [ ] 5.4 Improve incentive calculation display in OrderForm
    - Redesign calculation preview card with better visual hierarchy
    - Create stat display for calculated incentive amount (large, bold, colored)
    - Show rule breakdown in structured format with clear labels
    - Add visual separators between calculation steps
    - Format currency values consistently with ₹ symbol and thousand separators
    - Use color coding for different calculation components
    - Add descriptive labels for achievement percentage, margin tier, etc.
    - _Requirements: 1.2, 1.4, 2.1, 4.3, 10.4, 10.5, 10.8_
  
  - [ ] 5.5 Polish OrderForm action buttons and alerts
    - Replace submit buttons with new Button component (primary variant)
    - Add cancel button with secondary variant
    - Show loading state on save button with spinner
    - Display success message with success Alert component after save
    - Display error message with error Alert component on failure
    - Add dismissible error alerts with close button
    - Position buttons in footer with proper spacing (gap-2)
    - _Requirements: 7.1, 7.2, 7.6, 14.2, 14.3, 14.6_

- [ ] 6. Redesign IncentiveSchemes Panel
  - [ ] 6.1 Update IncentiveSchemes page header and structure
    - Modify `src/pages/OBSheetPanel/incentives/IncentiveSchemes.jsx`
    - Apply new PageHeader pattern with title and count badge
    - Add "New Scheme" button with primary Button styling and add icon
    - Add page description text below title
    - Apply proper header margins and spacing
    - _Requirements: 1.1, 1.2, 7.1, 7.10, 11.3_
  
  - [ ] 6.2 Restyle IncentiveSchemes table
    - Update table container with new Table component styling
    - Apply new header styling (uppercase, semibold, #f8fafd background)
    - Update table body with hover effects and consistent row styling
    - Format date columns with consistent styling (13px, #111827)
    - Style FY column with badge styling (#f0f4fa bg, 12px, #374151)
    - Replace status display with StatusBadge component
    - Update action buttons (edit icon) with icon button variant
    - Apply proper cell padding and alignment
    - _Requirements: 5.1-5.8, 8.3, 11.3, 11.4_
  
  - [ ] 6.3 Redesign scheme modal (create/edit)
    - Update scheme modal to use new Modal component structure
    - Apply modal header with title, description, and close button
    - Reorganize form fields in scrollable body section
    - Update all inputs to use new Input component styling
    - Style achievement slabs section with clear visual grouping
    - Style margin slabs section with clear visual grouping
    - Add proper spacing between form sections (space-y-4)
    - Update footer with primary and secondary buttons
    - Add validation error display
    - _Requirements: 6.1-6.9, 12.1-12.8_
  
  - [ ] 6.4 Polish loading states in IncentiveSchemes
    - Replace loading state with LoadingSpinner component
    - Add button loading states for save operations
    - Update empty state with EmptyState component
    - _Requirements: 13.1, 13.3, 13.5_

- [ ] 7. Redesign EmployeeTargets Panel
  - [ ] 7.1 Update EmployeeTargets page header and stats strip
    - Modify `src/pages/OBSheetPanel/incentives/EmployeeTargets.jsx`
    - Apply new PageHeader pattern with title and count badge
    - Add "Set Target" button with primary Button styling
    - Create stats strip with multiple stat cards in responsive grid
    - Style each stat card with icon, label (10.5px uppercase), and large value
    - Apply proper background (#f8fafd), border, and padding to stat cards
    - Add relevant icons for each metric (person, flag, check_circle)
    - Ensure responsive layout (2-4 columns based on viewport)
    - _Requirements: 1.1, 1.2, 4.3, 7.1, 10.1, 10.7, 11.3, 11.4_
  
  - [ ] 7.2 Restyle EmployeeTargets table
    - Update table container with new Table styling
    - Apply new header styling with proper column labels
    - Create employee cell with avatar + name + ID layout
    - Style avatar as circular with initial letter (32px, #2d55a0 bg, white text)
    - Display employee ID in monospace font with badge styling
    - Display scheme name with appropriate styling (13px, #374151)
    - Format target and achieved amounts with currency formatting
    - Right-align numeric columns
    - Replace status display with StatusBadge component
    - Update action buttons with icon button variant
    - _Requirements: 5.1-5.8, 8.3, 10.4, 11.4_
  
  - [ ] 7.3 Refine filter bar in EmployeeTargets
    - Create filter bar with search, status filter, and FY selector
    - Add search input with search icon using new Input styling
    - Update filter dropdowns with new Select styling
    - Add clear filters button if filters are active
    - Apply consistent spacing and responsive layout
    - _Requirements: 16.1-16.7_
  
  - [ ] 7.4 Redesign target assignment modal
    - Update target modal to use new Modal component
    - Apply modal header with title and description
    - Update employee selector with new Select styling
    - Update scheme selector with new Select styling
    - Style target amount input with new Input styling (number type)
    - Add FY selector with consistent styling
    - Group related fields with visual separation
    - Add validation error display
    - Update footer buttons with primary and secondary variants
    - _Requirements: 6.1-6.9, 12.1-12.8_

- [ ] 8. Redesign EmployeeOrdersPanel
  - [ ] 8.1 Update EmployeeOrdersPanel page header and controls
    - Modify `src/pages/OBSheetPanel/incentives/EmployeeOrdersPanel.jsx`
    - Apply new PageHeader pattern with title
    - Create controls bar with employee selector and freeze functionality
    - Style employee selector dropdown with new Select styling
    - Style row count input with new Input styling (number type)
    - Update "Freeze Selected" button with primary Button styling and lock icon
    - Apply proper spacing and layout to controls bar
    - _Requirements: 1.1, 1.2, 6.1, 6.2, 7.1, 11.3_
  
  - [ ] 8.2 Add employee info strip in EmployeeOrdersPanel
    - Create info strip showing selected employee details
    - Display avatar with employee initial (32px circle)
    - Show employee name (13px semibold), ID (11px monospace badge), and role
    - Add order count on the right side
    - Apply #eef2fb background with #c5d3e4/40 border
    - Add proper padding and rounded corners
    - _Requirements: 1.1, 2.1, 3.2, 4.3_
  
  - [ ] 8.3 Restyle EmployeeOrdersPanel table with selection
    - Update table container with new Table styling
    - Add checkbox column with proper alignment
    - Style checkboxes with #2d55a0 accent color
    - Apply new header styling
    - Update table body with hover effects
    - Add visual indication for frozen rows (different background color or badge)
    - Format numeric columns (invoice amount, incentive) with right alignment
    - Replace status display with StatusBadge component
    - Add totals footer row with bold styling and borders
    - _Requirements: 5.1-5.8, 6.8, 8.3, 8.7_
  
  - [ ] 8.4 Improve selection feedback and freeze confirmation
    - Show selected count badge when rows are selected
    - Display selection summary with color-coded background
    - Add freeze confirmation dialog using Modal component
    - Show success Alert after successful freeze operation
    - Show error Alert if freeze operation fails
    - Add visual feedback for frozen state (StatusBadge with frozen variant)
    - _Requirements: 8.3, 8.7, 14.2, 14.3_

- [ ] 9. Checkpoint - Panel Redesign Validation
  - Test all five panels for visual consistency
  - Verify design token usage across all panels
  - Test responsive layouts at multiple breakpoints (320px, 640px, 768px, 1024px, 1280px)
  - Ensure all tests pass, ask the user if questions arise

- [ ] 10. Cross-Panel Polish and Refinement
  - [ ] 10.1 Conduct visual consistency audit
    - Review color usage across all panels and verify alignment with design tokens
    - Check typography consistency (font families, sizes, weights, line heights)
    - Validate spacing adherence to the defined scale (4px increments)
    - Ensure icon consistency (Material Symbols Outlined, consistent sizes)
    - Verify border radius usage is consistent
    - Check shadow application is uniform across similar elements
    - _Requirements: 1.1-1.5, 2.1-2.8, 11.1-11.7_
  
  - [ ] 10.2 Responsive design testing and fixes
    - Test all panels at mobile breakpoint (320px, 640px)
    - Test all panels at tablet breakpoint (768px)
    - Test all panels at desktop breakpoints (1024px, 1280px)
    - Fix any layout issues on narrow screens (stacking, overflow)
    - Verify table horizontal scroll works on small screens
    - Ensure touch targets meet minimum 36px size on all devices
    - Test modal responsiveness and scrolling on mobile
    - Verify filter bars wrap properly on narrow screens
    - _Requirements: 15.1-15.8_
  
  - [ ] 10.3 Accessibility compliance audit
    - Test keyboard navigation through all interactive elements
    - Verify focus indicators are visible (2px outline, 10% opacity ring)
    - Check color contrast ratios meet WCAG AA (4.5:1 normal text, 3:1 large text)
    - Add missing ARIA labels for icon-only buttons
    - Verify form inputs have associated labels (visible or aria-label)
    - Test screen reader compatibility with error messages
    - Verify modal focus trap works correctly
    - Test ESC key closes modals
    - Add skip links if needed for keyboard navigation
    - Test with prefers-reduced-motion setting
    - _Requirements: 19.1-19.8_
  
  - [ ] 10.4 Animation and interaction polish
    - Verify all transition durations are appropriate (150-300ms)
    - Check easing functions create smooth motion
    - Test modal entry animations work smoothly
    - Verify button hover and active states provide good feedback
    - Test loading spinner animations are smooth
    - Check progress bar transitions are smooth (duration-700)
    - Verify dropdown menu animations feel natural
    - Test alert dismissal animations if applicable
    - _Requirements: 9.1-9.8_
  
  - [ ] 10.5 Performance optimization
    - Remove any unused Tailwind classes (run purge if needed)
    - Check for unnecessary component re-renders
    - Test table performance with large datasets (100+ rows)
    - Verify modal animations don't cause jank
    - Test scroll performance on long tables
    - Optimize any custom CSS if needed
    - _Requirements: All (implicit performance requirement)_

- [ ] 11. Create Design System Documentation
  - [ ] 11.1 Document design tokens and usage guidelines
    - Create `src/styles/DESIGN_SYSTEM.md` documentation file
    - Document all typography tokens (font families, sizes, weights, line heights, letter spacing)
    - Document complete color palette with semantic meanings and usage examples
    - Document spacing scale with application guidelines
    - Document border radius values and when to use each
    - Document shadow and elevation system with use cases
    - Document animation timing functions and recommended durations
    - Provide code examples for accessing tokens in JavaScript and Tailwind
    - _Requirements: 20.1, 20.2, 20.3, 20.7_
  
  - [ ] 11.2 Document component patterns and usage
    - Document Button component with all variants and props
    - Document Input, Select, Textarea components with examples
    - Document StatusBadge component with all status types
    - Document Card component variants
    - Document Modal component usage and props
    - Document Alert component severity variants
    - Document Table component structure and patterns
    - Document Loading and EmptyState components
    - Document Pagination component
    - Provide code examples for each component
    - _Requirements: 20.4, 20.5_
  
  - [ ] 11.3 Document layout patterns and responsive guidelines
    - Document PageHeader pattern with examples
    - Document FilterBar pattern with examples
    - Document employee info strip pattern
    - Document responsive breakpoints and design approach
    - Document mobile-first layout strategy
    - Provide examples of responsive grid usage
    - Document table scrolling approach on mobile
    - _Requirements: 20.6, 20.8_
  
  - [ ] 11.4 Create component usage examples
    - Add visual examples or screenshots for key components
    - Create code snippets for common patterns
    - Document best practices for component composition
    - Add troubleshooting guide for common issues
    - Document migration path from old styling to new
    - _Requirements: 20.5, 20.8, 20.9_

- [ ] 12. Final Checkpoint - Complete Redesign Review
  - Review all five panels for completeness
  - Verify all requirements are met
  - Test complete user flows (create order, edit scheme, set target, freeze orders)
  - Confirm design system is fully documented
  - Ensure all tests pass, ask the user if questions arise

## Notes

- This is a visual redesign only - all existing functionality must be preserved
- No property-based tests are needed as this work involves UI styling, not business logic
- Example-based unit tests should be added for new reusable components (Button, Input, Modal, etc.)
- Visual regression tests are recommended but not included as explicit tasks
- Test each panel thoroughly after redesign to ensure no functionality is broken
- Use the design document as a reference for all styling decisions
- Maintain consistency with the LoginPage aesthetic throughout
- All tasks reference specific requirements for traceability
- The implementation uses React (JavaScript/JSX) with Tailwind CSS
- Material Symbols Outlined icon set is used throughout

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "11.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "2.5", "2.6", "2.7"] },
    { "id": 4, "tasks": ["2.8", "2.9", "2.10"] },
    { "id": 5, "tasks": ["4.1", "5.1", "6.1", "7.1", "8.1"] },
    { "id": 6, "tasks": ["4.2", "5.2", "6.2", "7.2", "8.2"] },
    { "id": 7, "tasks": ["4.3", "5.3", "6.3", "7.3", "8.3"] },
    { "id": 8, "tasks": ["4.4", "5.4", "6.4", "7.4", "8.4"] },
    { "id": 9, "tasks": ["4.5", "5.5"] },
    { "id": 10, "tasks": ["10.1", "11.2"] },
    { "id": 11, "tasks": ["10.2", "10.3", "11.3"] },
    { "id": 12, "tasks": ["10.4", "10.5", "11.4"] }
  ]
}
```
