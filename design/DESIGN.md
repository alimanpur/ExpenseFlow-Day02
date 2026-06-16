---
name: High-Precision Utility
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#5f5e60'
  on-secondary: '#ffffff'
  secondary-container: '#e5e1e4'
  on-secondary-container: '#656466'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e5e1e4'
  secondary-fixed-dim: '#c8c6c8'
  on-secondary-fixed: '#1c1b1d'
  on-secondary-fixed-variant: '#474649'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-base:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.02em
  data-base:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  data-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-caps:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 16px
  margin-page: 32px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system is rooted in the "Engineering-First" aesthetic, prioritizing information density, clarity, and structural integrity over decorative elements. It is built for a professional financial environment where algorithmic precision is the core value proposition.

The visual style is **Minimalist-Functional**, drawing heavily from the interfaces of modern fintech infrastructure. It rejects the "magic" tropes of AI in favor of a transparent, data-driven utility. The emotional response is one of reliability, calmness, and absolute accuracy. The interface stays out of the way, allowing high-velocity financial workflows to take center stage through a rigorous adherence to grid systems and high-contrast typography.

## Colors
The palette is intentionally austere to emphasize data and action over decoration.
- **Primary / Action:** Midnight Ink (#0F172A) is reserved for high-priority interactive elements and primary buttons.
- **Text / Headers:** Slate Charcoal (#09090B) provides maximum legibility against the stark white background.
- **Surfaces:** A hierarchy of Whites (#FFFFFF), Off-Whites (#FAFAFA), and Cool Grays (#F4F4F5) creates a clean, layered environment without the need for shadows.
- **Borders:** Hairline borders (#E4E4E7) are the primary tool for spatial separation.
- **Semantic:** Use standard technical greens and reds for financial status, but keep them desaturated to maintain the professional tone.

## Typography
This design system uses a dual-font strategy to distinguish between UI navigation and financial data.
- **Geist:** Used for all interface elements, labels, and headings. Its clean, geometric sans-serif nature provides a modern, neutral tone.
- **JetBrains Mono:** Used exclusively for all numeric data, currencies, math operations, and algorithmic outputs. The monospaced nature ensures that columns of numbers align perfectly, aiding in rapid visual auditing.
- **Scale:** Maintain small, efficient font sizes (13px-14px for body) to maximize the "Information Density" required by financial power users.

## Layout & Spacing
The layout follows a strict **Fixed-Fluid Hybrid** grid based on a 4px baseline.
- **Desktop:** A 12-column grid with a 1280px max-width container. Sidebars are fixed at 240px or 280px to preserve utility space.
- **Gaps:** Use 16px (stack-md) for standard component spacing and 24px (stack-lg) for section separation.
- **Density:** High density is preferred. Use tight padding in data tables (8px vertical, 12px horizontal) to allow more rows to be visible above the fold.
- **Alignment:** All elements must align to the hairline border grid. Avoid centered layouts; use left-aligned structures to mirror logical reading paths.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** and **Structural Outlines** rather than shadows.
- **Level 0 (Background):** #FFFFFF for the primary canvas.
- **Level 1 (Surface):** #FAFAFA for sidebar containers, card backgrounds, or secondary navigation.
- **Level 2 (Inlay):** #F4F4F5 for input fields and nested data groups.
- **Borders:** Every container is defined by a crisp 1px border (#E4E4E7). 
- **Shadows:** Avoid drop shadows entirely, except for floating "Command Palettes" or temporary dropdown menus, which should use a very tight, 2px blur with 5% opacity to differentiate from the base layer.

## Shapes
The shape language is "Soft-Mechanical." Use a consistent **4px to 6px radius** for all interactive components (buttons, inputs, cards). This provides a hint of approachability while maintaining the precise, engineering-focused look. 
- **Buttons:** 6px radius.
- **Inputs:** 4px radius.
- **Status Tags:** 2px radius or sharp edges to indicate technical precision.
- **Strictness:** Do not use fully rounded "pill" shapes for any core UI elements.

## Components
- **Buttons:** Primary buttons are Midnight Ink (#0F172A) with White text. Secondary buttons use White backgrounds with 1px #E4E4E7 borders. No gradients or inner glows.
- **Data Tables:** The core of the system. Use JetBrains Mono for all cell values. Use #FAFAFA for header rows. Cell borders should be horizontal-only to emphasize row scanning.
- **Input Fields:** Use #FFFFFF background with a 1px #E4E4E7 border. On focus, the border changes to #0F172A (Midnight Ink). Labels should be Geist 12px Semi-bold.
- **Chips/Badges:** Small, rectangular tags with 2px radius. Use subtle background tints (e.g., desaturated green for 'Approved') and Geist 11px Caps.
- **Cards:** No shadows. Define card boundaries using the #E4E4E7 hairline border. Card headers should be separated by a horizontal rule.
- **Algorithmic Indicators:** Use small "Mono" tags for AI-generated insights, clearly distinguishing them from user-entered data via a light gray background (#F4F4F5).