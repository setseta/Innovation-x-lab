# Innovation X Lab
## Server setup and environment

The backend requires a MongoDB connection string provided via environment variables. Do NOT store secrets in the repository.

- Copy the example env in `server/.env.example` to `server/.env` and fill in values.
- Ensure `MONGO_URI` is set to your MongoDB URL (the server will refuse to start without it).

Example `server/.env` entries:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-strong-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongAdminPassword
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=5000
```

Start the server locally (example):

```bash
cd server
cp .env.example .env
# edit server/.env to set MONGO_URI and other secrets
npm install
node server.js
```

Deployment notes:
- When deploying (Render, Vercel, etc.) set the `MONGO_URI` environment variable in the provider dashboard — do not commit it to git.
- The server will exit if `MONGO_URI` is not set to avoid running without your database.

If you accidentally committed secrets (like `server/.env`) to git:

```bash
# Remove the file and stop tracking it
git rm --cached server/.env
git commit -m "Remove sensitive env file"

# To fully remove secrets from Git history, use GitHub's recommended tool or BFG / git filter-repo.
# Follow: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
```


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
