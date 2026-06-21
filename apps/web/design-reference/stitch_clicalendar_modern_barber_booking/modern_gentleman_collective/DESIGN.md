---
name: Modern Gentleman Collective
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#dfc0b2'
  on-secondary: '#3f2c22'
  secondary-container: '#5a443a'
  on-secondary-container: '#d0b2a4'
  tertiary: '#d0cdcd'
  on-tertiary: '#303030'
  tertiary-container: '#b4b2b2'
  on-tertiary-container: '#454545'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#fcdccd'
  secondary-fixed-dim: '#dfc0b2'
  on-secondary-fixed: '#28180f'
  on-secondary-fixed-variant: '#574237'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1b1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-mobile: 20px
  container-padding-desktop: 40px
  gutter: 24px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is engineered for the modern grooming experience, blending the raw, industrial energy of an urban barbershop with the quiet sophistication of a luxury lounge. The personality is masculine, decisive, and premium, targeting a clientele that values precision and a curated atmosphere. 

The aesthetic direction is **Refined Urban Minimalism**. It avoids the clutter of traditional "vintage" barbershop tropes, instead opting for a dark, atmospheric interface. This is achieved through deep, layered neutrals and high-contrast gold accents that act as a visual signature for premium actions and status. The emotional response should be one of confidence, cleanliness, and exclusive access.

## Colors

The palette is strictly dark-mode first to evoke a sense of luxury and focus. 

- **Primary (Amber Gold):** Used sparingly but impactfully for primary call-to-actions, status indicators, and key brand highlights.
- **Secondary (Dark Wood):** A deep, warm brown used for subtle background containers and decorative elements to prevent the UI from feeling cold or clinical.
- **Tertiary (Charcoal):** The workhorse color for surface containers, input fields, and card backgrounds.
- **Neutral (Obsidian Black):** The base canvas. Pure black is used for the deepest background layers to maximize contrast with the gold accent.
- **Text:** High-contrast off-white (#F5F5F5) for primary body text and muted grey (#9E9E9E) for secondary metadata.

## Typography

This design system utilizes a high-contrast typographic pair. **Playfair Display** provides a classic, editorial feel for headlines, evoking the craftsmanship of a master barber. **Inter** provides a clean, highly legible functional layer for booking flows, pricing, and timing.

All labels and small metadata should use uppercase Inter with increased letter spacing to maintain a structured, organized appearance. Large displays on mobile should scale down to ensure headlines do not wrap awkwardly.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. Content is centered on a 12-column grid for desktop (max-width 1280px) and a 4-column grid for mobile. 

The rhythm is generous; whitespace is used to communicate luxury. Elements should be grouped into logical "stacks" using the 8px base unit. Section-to-section spacing should be aggressive (stack-lg) to allow the "urban" imagery and typography to breathe.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** rather than heavy shadows. 

1. **Level 0 (Base):** Obsidian Black (#0A0A0A) for the main application background.
2. **Level 1 (Cards/Containers):** Charcoal Grey (#1F1F1F). These surfaces should have a very subtle 1px border of #2C1B12 to define edges.
3. **Level 2 (Modals/Popovers):** Deep Wood (#2C1B12) with a soft, diffused black shadow (0px 12px 24px rgba(0,0,0,0.5)).

To hint at texture, Level 1 containers can feature a 5% opacity noise overlay or a very subtle carbon-fiber pattern to reinforce the urban, masculine theme.

## Shapes

The design system uses a **Rounded** corner language. While the brand is masculine, "Sharp" edges are avoided to maintain an approachable, premium feel. 

- **Standard Buttons & Inputs:** 8px (0.5rem) radius.
- **Cards & Large Containers:** 16px (1rem) radius.
- **Selection Pills:** Fully rounded (pill-shaped) to distinguish them from structural elements.

## Components

### Buttons
- **Primary:** Amber Gold background, black text, bold weight. No shadow, but a slight 2px inner glow on hover.
- **Secondary:** Transparent background with a 1px Gold border.
- **Ghost:** Charcoal background with muted grey text for less important actions like "Cancel".

### Cards (Service/Barber Profiles)
Cards use the Level 1 Charcoal surface. Service prices should be highlighted in Gold. Barber profile photos should be treated with a slight desaturation or "film grain" filter to maintain the atmospheric aesthetic.

### Input Fields
Inputs should be dark (#0A0A0A) with a 1px #1F1F1F border. Upon focus, the border transitions to Gold. Labels remain small, uppercase, and Gold when active.

### Booking Calendar
The calendar grid should be minimal, using subtle dividers. The "Selected Date" is indicated by a Gold circle, while "Available Times" are displayed as Charcoal chips that turn Gold on selection.

### Professional Placeholders
Use high-contrast, black-and-white photography with deep shadows for all image placeholders. Portraits should be framed tightly to emphasize the "precision" of the brand.