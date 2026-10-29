# Ekdrishti Studios - Website and Case Study CMS

React/Vite website and case-study editor with an Express API, MongoDB persistence, admin authentication, media uploads, and configurable case-study sections.

## 🚀 Tech Stack

- **Vite** - Lightning-fast build tool
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Express / MongoDB** - API and persisted case-study data
- **Framer Motion** - Animation library (ready for integration)

## 📁 Project Structure

```
src/
├── api/              # API clients for contact forms and media uploads
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
- `/blogs` - Journal, with published articles, categories and meaningful author profiles
- `/ownercontrols_panel/blogs` - Protected Content Studio

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

### Prerequisites and environment

Run commands from the project root. Node.js 22.17.0 and npm 10.9.2 are verified with this project. A reachable MongoDB instance is required for case studies and admin login.

Install dependencies on a fresh checkout:

```powershell
npm.cmd ci
```

The backend reads the root `.env` file. Keep your existing configuration. For a new setup, create `.env` with at least these values (replace the placeholders with your own):

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/ekdrishti
JWT_SECRET=replace-with-a-long-random-secret
BOOTSTRAP_ADMIN=false
```

The example above requires a local MongoDB server; use your Atlas connection string instead when appropriate, with database credentials and network access configured. The `.env.example` template now includes core backend and optional Blog integration settings. Blog revisions require Atlas or a transaction-capable local replica set; the existing standalone MongoDB example above is sufficient only for features that do not use transactions. Never commit your populated `.env`.

SMTP settings configure contact-form email delivery. AWS S3 settings configure cloud media uploads; the upload handler also supports local storage in `public/uploads`. These services are separate from starting the frontend and API. Vite reads `VITE_*` settings from root environment files; restart Vite after changing them. The current frontend calls relative `/v1` routes, so local and LAN requests go through Vite's proxy.

### Start the full app on Windows PowerShell

Keep both terminals running. Use `npm.cmd` if PowerShell blocks `npm.ps1`.

Terminal 1 - API:

```powershell
$env:PORT = '3001'
$env:HOST = '127.0.0.1'
$env:BOOTSTRAP_ADMIN = 'false'
npm.cmd run api
```

Terminal 2 - frontend:

```powershell
npm.cmd run dev -- --host 0.0.0.0 --port 3000 --strictPort --open false
```

Open **http://localhost:3000/** on this computer. For another device on the same network, use the **Network** URL printed by Vite, such as `http://192.168.1.64:3000/`. The IP may change; use the current terminal output. Allow Node.js through Windows Firewall on your private network if another device cannot connect. This LAN address is not a public internet URL.

Vite proxies `/v1`, `/api`, and `/health` to the API on port 3001. Only port 3000 needs LAN access. Running `npm.cmd run dev` alone starts the frontend; it does not start the backend. Strict port mode avoids accidentally opening a second frontend on a different port.

Admin login is at `/ownercontrols_panel/login` and uses an existing admin account. Startup does not create or reset accounts. Admin bootstrap is a separate explicit setup using `BOOTSTRAP_ADMIN=true`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD_HASH`.

### Verify startup

```powershell
Invoke-RestMethod http://localhost:3000/v1/ping
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/v1/cases
```

Ping verifies the API proxy. Health checks MongoDB connectivity, local upload storage, and whether email settings are present; it does not send a test email or verify S3. The cases endpoint verifies that saved case studies can be read. A homepage alone does not establish that the database works.

If API requests return 503, check Terminal 1 and port 3001. If health reports an unhealthy database, check `MONGODB_URI`, MongoDB availability, credentials, and Atlas network access. A degraded email status means SMTP settings are missing. If port 3000 is occupied, reuse the existing project server or stop it before restarting. Stop each server with Ctrl+C in its terminal.

### Checks and production build

```powershell
npm.cmd run test:block-isolation
npm.cmd run test:media-system
npm.cmd run build
```

The production build is written to `dist`. To serve the built frontend and API together locally, first stop the two development servers, then run:

```powershell
$env:PORT = '3000'
$env:HOST = '0.0.0.0'
$env:BOOTSTRAP_ADMIN = 'false'
npm.cmd start
```

`npm.cmd run preview` previews built frontend assets only and is not a full-stack server. `npm.cmd run audit` provides the separate readiness audit; see [the local workflow audit](docs/LOCAL_WORKFLOW_AUDIT.md) for context and limits.

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

The frontend already calls the Express backend. Contact submissions use `POST /v1/contact`; case studies use `/v1/cases`; authentication uses `/v1/auth/login` and `/v1/auth/me`; media uploads use `/v1/upload`. In development, Vite forwards these requests to port 3001. The API also exposes compatible `/api` aliases defined in [server.js](server.js).


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
- ✅ Express API integration
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
- vite: ^7.3.1

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

Use the two-terminal startup above to run the complete app locally.


## Content Studio / Blog CMS

The Blog CMS adds a Tiptap writing editor, images, independent FAQs, SEO settings, preview, autosave/recovery, revision history, publication scheduling, categories, settings and optional real Search Console / IndexNow integrations. Public article content and metadata are rendered by Express in the initial HTML response; updates do not require rebuilding the frontend. The existing Case CMS remains independent.

Read [the Content Studio engineering report and deployment guide](CONTENT_STUDIO.md) for models, routes, security, test coverage and release gates. Run `npm.cmd run test:blog-cms` and `npm.cmd run test:blog-browser` for isolated Blog regression checks. The browser suite reuses the existing optional Playwright/Edge QA tooling in `scratch/qa`.

**Production SEO is not verified.** Serve Blog/API/sitemap routes through the Node runtime; the existing static FTP deployment of `dist/` alone cannot serve dynamic article HTML. A Vercel adapter is provided but has not been deployed or verified. No example articles are seeded into production.
