# Shahbaz Store - Next.js E-commerce

This is a Next.js 14 e-commerce frontend (based on the Porto HTML template), built with TypeScript and the App Router.

## Project Structure

- `app/` - Next.js App Router pages
  - `page.tsx` - Home page (from demo29.html)
  - `products/page.tsx` - Products listing (from category-6col.html)
  - `product/[id]/page.tsx` - Product detail (from product.html)
- `components/` - React components
  - `layout/` - Header, Footer, MobileMenu
  - `product/` - ProductCard, ProductGrid, ProductCarousel
  - `common/` - Cart, Search
  - `banners/` - HomeBanner
- `public/assets/` - All static assets (CSS, images, fonts, etc.)
- `lib/` - Utilities and stores
- `types/` - TypeScript type definitions

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Features

- ✅ TypeScript for type safety
- ✅ Next.js 14 App Router
- ✅ React components replacing jQuery
- ✅ Swiper.js for carousels (replacing Owl Carousel)
- ✅ Zustand for state management (cart)
- ✅ Preserved original CSS and styling
- ✅ Responsive design maintained

## Pages

- `/` - Home page with banners, featured products, and blog section
- `/products` - Products listing with filters and 6-column grid
- `/product/[id]` - Product detail page with image gallery and product options

## Technologies Used

- Next.js 14
- React 19
- TypeScript
- Swiper.js (for carousels)
- Zustand (for state management)
- Bootstrap CSS (original styles preserved)
- FontAwesome (for icons)

## Notes

- All original CSS files are preserved and imported globally
- Original class names are maintained for CSS compatibility
- jQuery functionality has been replaced with React state and hooks
- Images use Next.js Image component where appropriate
- Cart functionality is implemented with Zustand store

## Deployment to Vercel

This project is configured for deployment on Vercel. Follow these steps:

### Prerequisites

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Have a Vercel account (sign up at [vercel.com](https://vercel.com))

### Deployment Steps

1. **Import Project to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository

2. **Configure Environment Variables:**
   - In your Vercel project settings, go to "Environment Variables"
   - Add the following variable:
     - `NEXT_PUBLIC_API_URL`: Your production API URL (e.g., `https://your-api-domain.com`)
   - Make sure to add it for all environments (Production, Preview, Development)

3. **Deploy:**
   - Vercel will automatically detect Next.js and configure the build
   - The deployment will start automatically after importing
   - Your site will be live at `https://your-project.vercel.app`

### Important Notes

- **CORS Configuration:** Ensure your backend API allows requests from your Vercel domain
- **API URL:** Never use `localhost:5000` in production - always use your production API URL
- **Environment Variables:** All `NEXT_PUBLIC_*` variables must be set in Vercel dashboard
- **Build:** The project uses `npm run build` which is automatically detected by Vercel

### Local Development

For local development, create a `.env.local` file (not committed to git):

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The `.env.example` file shows the required environment variables.
