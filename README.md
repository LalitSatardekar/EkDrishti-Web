# Premium Digital Marketing Agency - Frontend

A production-quality React frontend for a premium digital marketing agency website built with modern technologies and best practices.

## 🚀 Tech Stack

- **Vite** - Lightning-fast build tool
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client (ready for backend integration)
- **Framer Motion** - Animation library (ready for integration)

## 📁 Project Structure

```
src/
├── api/              # Mock API layer (ready for backend integration)
│   └── contactApi.js
├── components/
│   ├── layout/      # Layout components
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── sections/    # Home page sections
│   │   ├── Hero.jsx
│   │   ├── ServicesPreview.jsx
│   │   ├── CaseStudiesPreview.jsx
│   │   ├── Testimonials.jsx
│   │   └── CTABand.jsx
│   └── ui/          # Reusable UI components
│       ├── Button.jsx
│       └── Card.jsx
├── data/            # Mock data
│   └── content.js
├── hooks/           # Custom React hooks
│   └── useScrollPosition.js
├── lib/             # Utility functions
│   └── utils.js
├── pages/           # Route pages
│   ├── Home.jsx
│   ├── Work.jsx
│   ├── WorkDetail.jsx
│   ├── Services.jsx
│   ├── About.jsx
│   └── Contact.jsx
├── App.jsx          # Main app component with routing
├── main.jsx         # Entry point
└── index.css        # Global styles & Tailwind directives
```

## 🎨 Design System

### Color Palette

- **Primary**: `#0B1120` - Main background
- **Secondary**: `#111827` - Secondary background
- **Surface**: `#0F172A` - Card backgrounds
- **Accent**: `#2563EB` - Primary accent color
- **Accent Light**: `#38BDF8` - Secondary accent color
- **Text Primary**: `#E5E7EB` - Main text color
- **Text Secondary**: `#94A3B8` - Secondary text color
- **Border Subtle**: `#1F2937` - Border color

### Typography

- **Headings**: Plus Jakarta Sans
- **Body**: Inter

### Key Features

- Dark bluish premium theme
- Subtle radial gradient background
- Glass morphism effects on cards
- Smooth transitions and hover effects
- Responsive design (mobile-first)

## 🛣️ Routes

- `/` - Home page with all sections
- `/work` - Portfolio/case studies listing
- `/work/:slug` - Individual case study detail
- `/services` - Services overview
- `/about` - About the agency
- `/contact` - Contact form

## 🏗️ Key Components

### Layout

- **Navbar**: Transparent on load, solid on scroll with mobile menu
- **Footer**: Minimal dark footer with links and social media

### Home Page Sections

1. **Hero**: Large headline, CTA buttons, stats, and image placeholder
2. **Services Preview**: Grid of service cards with hover effects
3. **Case Studies**: Large image cards with gradient overlays
4. **Testimonials**: Glass-style testimonial cards
5. **CTA Band**: Full-width accent-colored call-to-action

### Image Placeholders

All image placeholders are clearly labeled so you can easily drop in your own images without restructuring code. Look for comments indicating:
- Hero images
- Case study images
- Service images
- Team photos

## 📝 Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The site will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Optimize Local Assets

Generate compressed copies that mirror the source folder structure into fully separate trees — `public/assets/original/...` for lightly optimized originals and `public/assets/webp/...` for the compressed versions — while leaving `src/assets` untouched:

```bash
npm run assets:compress
```

This script uses `sharp` to resize to a 2000px max width, rotate based on EXIF data, and only reprocesses files whose sources changed. Run it before uploading assets to S3 or pushing new media.

#### Pointing assets to S3 / CDN

1. Upload the contents of `public/assets/original` and `public/assets/webp` to your bucket/CDN, preserving the folder hierarchy.
2. Add the following to your `.env` (values can be any HTTPS root):

  ```bash
  VITE_ASSET_ORIGINAL_BASE_URL="https://cdn.example.com/assets/original"
  VITE_ASSET_WEBP_BASE_URL="https://cdn.example.com/assets/webp"
  # Optional: set to "original" if you cannot serve WebP yet
  VITE_ASSET_DEFAULT_VARIANT="webp"
  ```

3. Restart `npm run dev`. The `asset()` helper used across [src/data/cases.js](src/data/cases.js#L1-L120) will now emit fully-qualified S3 URLs (WebP for images, originals for everything else).

## 🔌 API Integration

The contact form uses a mock API (`src/api/contactApi.js`) that simulates async calls. To integrate with your backend:

1. Replace the mock functions with actual Axios calls
2. Update the API endpoints
3. Components won't need changes as they already handle promises

Example:

```javascript
// Current mock
export const submitContactForm = async (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: '...' })
    }, 1000)
  })
}

// Replace with real API call
import axios from 'axios'

export const submitContactForm = async (formData) => {
  const response = await axios.post('/api/contact', formData)
  return response.data
}
```

## 🎞️ Adding Framer Motion

Framer Motion is included in dependencies. To use it:

```javascript
import { motion } from 'framer-motion'

// Wrap components
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* content */}
</motion.div>
```

## 🎯 Best Practices Implemented

- ✅ Scalable folder structure
- ✅ Separation of concerns
- ✅ Reusable components
- ✅ Mock API layer for easy backend integration
- ✅ Responsive design
- ✅ Semantic HTML
- ✅ Accessibility considerations
- ✅ Clean, maintainable code
- ✅ Glass morphism and modern design patterns
- ✅ Performance optimized

## 📦 Dependencies

### Production
- react: ^18.3.1
- react-dom: ^18.3.1
- react-router-dom: ^6.26.0
- axios: ^1.7.2
- framer-motion: ^11.3.0

### Development
- @vitejs/plugin-react: ^4.3.1
- tailwindcss: ^3.4.6
- autoprefixer: ^10.4.19
- postcss: ^8.4.39
- vite: ^5.3.4

## 🎨 Customization

### Update Colors

Edit `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  primary: '#YOUR_COLOR',
  // ...
}
```

### Update Fonts

Edit the Google Fonts link in `index.html` and update `tailwind.config.js`

### Update Content

All content is centralized in `src/data/content.js` for easy editing

## 📄 License

This project is created for your use.

---

**Ready to go!** Just install dependencies and run `npm run dev` to start developing.
