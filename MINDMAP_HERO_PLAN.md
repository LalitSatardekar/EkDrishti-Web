# Mind Map Hero Section - Implementation Plan

## Overview
Create an animated mind map hero section for three service pages (Events, Digital Marketing, Production) with "WE MANAGE" as the central node and service items as floating leaves with golden glow effects.

## Design Requirements

### Visual Design
- **Central Node**: "WE MANAGE" text in large, bold typography
- **Service Bubbles**: Pill-shaped containers with golden glow effect
- **Connecting Lines**: Visible lines connecting center to each service bubble
- **Layout**: Services positioned organically (left, right, top, bottom) around center
- **Color Scheme**: Dark background with golden/amber accents matching existing theme
- **Glow Effect**: Golden radial glow around each bubble (similar to design image)

### Animation Sequence
1. **Initial State**: All service bubbles clustered near center (scale: 0, opacity: 0)
2. **Expansion**: Bubbles spread out to their final positions (1.5s duration)
3. **Settle**: Bubbles reach final positions with slight overshoot/bounce
4. **Float**: Continuous gentle floating motion (subtle y-axis movement)

### Service Content

#### Events Page
- Corporate events
- Weddings
- Sports
- Bdays and anniversary
- Concerts
- Small fam events (baby shower and naming ceremony)
- Poojas

#### Digital Marketing Page
- Social media marketing
- SEO and SEM
- Email marketing
- Whatsapp marketing
- GMB optimization
- Performance marketing (meta, google and linkedin)
- Influencer marketing
- Strategic brand building (digital)
- Content creation (graphics and audio visuals)

#### Production Page
- Photography
- Videography
- Cinematography
- Audio production (in 21 national and international lang)
- Graphic designing
- All type of printing services

## Technical Implementation

### Component Structure
```
src/components/hero/
├── MindMapHero.jsx          # Main hero component
├── mindMapConfig.js         # Configuration for each service page
└── styles/
    └── mindmap.css          # Custom animations (if needed)
```

### Technology Stack
- **React**: Component structure
- **GSAP**: Animation library (already in use)
- **Tailwind CSS**: Styling
- **SVG**: For connecting lines

### Key Features
1. **Responsive Design**: Adapt layout for mobile, tablet, desktop
2. **Performance**: Optimize animations for smooth 60fps
3. **Accessibility**: Ensure keyboard navigation and screen reader support
4. **Reusability**: Single component used across all three pages with different configs

## Implementation Steps

### Phase 1: Component Setup
1. Create `MindMapHero.jsx` component
2. Create `mindMapConfig.js` with service data for all three pages
3. Set up basic structure with center node

### Phase 2: Layout & Positioning
1. Calculate positions for service bubbles (circular/organic distribution)
2. Implement responsive positioning logic
3. Create SVG connecting lines from center to each bubble

### Phase 3: Styling
1. Style central "WE MANAGE" node
2. Style service bubbles with golden borders
3. Add golden glow effects using box-shadow and pseudo-elements
4. Implement dark background with noise texture (matching existing design)

### Phase 4: Animation
1. Set up GSAP timeline for initial animation
2. Implement cluster → spread animation
3. Add continuous floating motion using GSAP
4. Fine-tune timing and easing functions

### Phase 5: Integration
1. Replace existing hero sections in:
   - `src/pages/services/FamilyEvents.jsx`
   - `src/pages/services/DigitalMarketing.jsx`
   - `src/pages/services/Production.jsx`
2. Test on all three pages
3. Ensure smooth transitions

### Phase 6: Polish & Optimization
1. Add hover effects on service bubbles
2. Optimize animation performance
3. Test responsive behavior
4. Add loading states if needed
5. Accessibility audit

## Design Specifications

### Typography
- **Center Node**: 
  - Font: Plus Jakarta Sans (heading font)
  - Size: 4xl-6xl (responsive)
  - Weight: Bold
  - Color: Gradient (amber to accent)
  - Letter spacing: Wide

- **Service Bubbles**:
  - Font: Inter (body font)
  - Size: sm-base
  - Weight: Medium
  - Color: textPrimary
  - Text transform: Uppercase

### Colors
- Background: `#0B1120` (primary)
- Bubble background: `rgba(15, 23, 42, 0.6)` (surface with opacity)
- Border: `rgba(245, 158, 11, 0.3)` (amber-500/30)
- Glow: `rgba(245, 158, 11, 0.15)` (amber-500/15)
- Text: `#E5E7EB` (textPrimary)
- Lines: `rgba(245, 158, 11, 0.2)` (amber-500/20)

### Spacing & Sizing
- Hero height: `min-h-screen` or `min-h-[90vh]`
- Center node: 200-300px width
- Service bubbles: padding 16-24px, auto width
- Bubble spacing: 150-250px from center (varies by position)
- Line width: 1-2px

### Animation Timing
- Initial delay: 0.3s (after page load)
- Expansion duration: 1.5s
- Stagger delay: 0.08s per bubble
- Float duration: 3-4s (continuous loop)
- Float amplitude: 10-15px

## Responsive Breakpoints

### Mobile (< 768px)
- Reduce bubble count visibility (show 4-5 key services)
- Smaller center node
- Tighter spacing
- Simplified layout (more vertical)

### Tablet (768px - 1024px)
- Show 6-7 services
- Medium spacing
- Balanced layout

### Desktop (> 1024px)
- Show all services
- Full spacing
- Organic circular layout matching design

## Accessibility Considerations
- Semantic HTML structure
- ARIA labels for decorative elements
- Reduced motion support (prefers-reduced-motion)
- Keyboard navigation for interactive elements
- Screen reader announcements for service list

## Performance Optimization
- Use `will-change` CSS property for animated elements
- Implement `requestAnimationFrame` for smooth animations
- Lazy load if hero is below fold
- Optimize SVG paths
- Use CSS transforms (GPU accelerated)

## Testing Checklist
- [ ] Animation plays smoothly on page load
- [ ] All service items display correctly on each page
- [ ] Responsive layout works on mobile, tablet, desktop
- [ ] Hover effects work as expected
- [ ] Accessibility features functional
- [ ] Performance metrics acceptable (60fps)
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] No layout shift during animation

## Future Enhancements (Optional)
- Click on service bubble to scroll to relevant section
- Parallax effect on scroll
- Interactive hover states with service descriptions
- Color variations per service category
- Particle effects around bubbles

## Files to Create/Modify

### New Files
- `src/components/hero/MindMapHero.jsx`
- `src/components/hero/mindMapConfig.js`

### Modified Files
- `src/pages/services/FamilyEvents.jsx`
- `src/pages/services/DigitalMarketing.jsx`
- `src/pages/services/Production.jsx`
- `src/index.css` (if custom animations needed)

## Estimated Timeline
- Phase 1: 1 hour
- Phase 2: 2 hours
- Phase 3: 2 hours
- Phase 4: 3 hours
- Phase 5: 1 hour
- Phase 6: 2 hours
- **Total**: ~11 hours

## Success Criteria
✅ Mind map hero displays on all three service pages
✅ Animation sequence works smoothly (cluster → spread → float)
✅ Golden glow effect matches design
✅ Responsive across all devices
✅ Performance maintains 60fps
✅ Accessible to all users
✅ Matches existing design system