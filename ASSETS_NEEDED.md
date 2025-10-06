# Assets Required for Autogen Design

## Priority: CRITICAL

### 1. Hero Section Image
- **File**: `public/autogen-hero-image.webp`
- **Dimensions**: 1920x1080px or similar widescreen format
- **Purpose**: Main landing page hero image showcasing AI-generated art
- **Style**: Professional, modern, showcasing Autogen Design's capabilities
- **Content Suggestions**:
  - Montage of AI-generated images in various styles
  - Futuristic UI mockup of the generator in action
  - Abstract visualization of AI/FLUX technology
  
### 2. Brand Logos
- **Primary Logo**: `public/logos/autogen-logo.svg` (vector)
  - Horizontal variant
  - Square/icon variant
  - Dark mode variant
  
- **Favicon Set**:
  - `public/favicon.ico` (16x16, 32x32, 48x48)
  - `public/favicon.png` (32x32)
  - `public/apple-touch-icon.png` (180x180)
  - `public/favicon-16x16.png`
  - `public/favicon-32x32.png`

### 3. "Clippy" Mascot/Character Elements
- **File**: `public/clippy/`
  - `clippy-welcome.svg` - Friendly greeting pose
  - `clippy-thinking.svg` - Processing/generating pose
  - `clippy-success.svg` - Celebration pose
  - `clippy-error.svg` - Helpful error state
  
- **Purpose**: Brand personality, user guidance, loading states
- **Style**: Modern, friendly, tech-savvy assistant character

### 4. Feature Section Icons (if replacing current placeholders)
- User-friendly icon
- High-quality outputs icon
- Creative potential icon
- Royalty-free icon

### 5. How It Works Section Illustrations
- Enter prompt illustration
- Select style illustration
- Generate image illustration
- Download/share illustration

## Secondary Assets

### 6. Marketing/Social Media
- **OpenGraph Image**: `public/og-image.jpg` (1200x630)
- **Twitter Card**: `public/twitter-card.jpg` (1200x600)

### 7. Loading/Placeholder States
- Image generation placeholder
- Loading spinner with Autogen branding
- Empty gallery state illustration

### 8. Example Generated Images
- Portfolio showcase images in `public/generated/examples/`
- Various styles: realistic, artistic, abstract, technical
- Demonstrate range of capabilities

## Technical Specifications

- **Image Formats**: 
  - Vector: SVG (preferred for logos/icons)
  - Raster: WebP (primary), PNG (fallback)
  
- **Color Profiles**: 
  - Support both light and dark mode variants
  - Use brand colors from `config/site.ts`

- **Optimization**:
  - WebP images should be optimized for web (<500KB)
  - SVGs should be minified
  - Provide @2x and @3x variants for hi-DPI displays

## Brand Guidelines to Follow

- **Color Palette**: Blue/Violet gradient theme (from site config)
- **Style**: Modern, clean, professional yet approachable
- **Tone**: Innovative, empowering, creative
- **Avoid**: Overly corporate, dated design patterns, stock photo feel

## Implementation Notes

1. All images should include proper alt text for accessibility
2. Use Next.js Image component for automatic optimization
3. Implement lazy loading for non-critical images
4. Provide dark mode variants where applicable
5. Ensure WCAG 2.1 AA compliance for contrast ratios

## Current Status

- [x] Copyright updated to 2025
- [x] Hero image path updated (needs actual file)
- [ ] Create/source hero image
- [ ] Design and create logo set
- [ ] Develop Clippy mascot character
- [ ] Create favicon set
- [ ] Replace placeholder feature icons
- [ ] Add OG/social media images

---
*Document created: October 4, 2025*
*Last updated: October 4, 2025*
