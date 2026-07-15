# Innovation X Lab

A premium technology media platform built with React, Vite, TypeScript, Tailwind CSS, and Framer Motion.

## Features
- Dark-first premium editorial UI
- Responsive home page and lab pages
- AI, Gadget, Software, Code, Startup, and Review experiences
- Article detail, about, contact, and admin placeholder pages
- Search and category filtering
- Theme toggle, mobile navigation, and back-to-top button
- SEO files for robots and sitemap
- Express/MongoDB backend scaffold for future expansion

## Local Development
1. Install frontend dependencies:
   - `npm install`
2. Start the frontend:
   - `npm run dev`
3. Start the backend API (optional):
   - `cd server && npm install && npm run dev`

The frontend will be available at http://localhost:3000 and the backend at http://localhost:5000.

## Production Build
- `npm run build`

## Deployment
### Vercel
- Connect the repository to Vercel.
- Set the build command to `npm run build`.
- Set the output directory to `dist`.

### Render
- Create a web service for the frontend using the Vercel build settings above.
- For the backend, create a separate service in the `server` directory with `npm install` and `npm run dev`.
- Set the `MONGO_URI` environment variable for the backend.
