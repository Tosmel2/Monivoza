# Monivoza

A modern online banking dashboard built with React and Vite. It includes authentication flows, a responsive UI, routing, state/query management, charts, and an admin area. This README documents the actual project setup and how to run it locally.

## Features
- Authentication: Login and Registration pages wired for backend integration
- Dashboard with cards, charts, and stats
- Accounts and Transactions pages
- Loans: listing, calculator, application, and details pages
- Admin area: dashboard, users, and loans management views
- Responsive design using Tailwind CSS v4
- Routing with React Router
- Server-state management and caching with TanStack Query (React Query)
- Charts with Recharts
- Motion/animation with Framer Motion

## Tech Stack
- React 19 + Vite 7
- Tailwind CSS 4 (via `@tailwindcss/vite` plugin)
- React Router DOM 6
- @tanstack/react-query 5
- Recharts, Framer Motion, Lucide Icons
- ESLint 9
- Path alias: `@` → `./src` (configured in `vite.config.js`)

## Requirements
- Node.js 18+ (LTS recommended)
- npm 9+ (comes with Node LTS)

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root (optional if you use the default demo API):
   ```bash
   # API base URL used by the auth service
   VITE_API_URL=https://your-api.example.com/api/v1
   ```
   If not provided, the app defaults to `https://your-api.example.com/api/v1` (see `src/api/authService.js`).
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
5. Preview the production build locally:
   ```bash
   npm run preview
   ```
6. Lint the project:
   ```bash
   npm run lint
   ```

## Environment & Configuration
- API base URL is read from `import.meta.env.VITE_API_URL`. Configure it in a root `.env` file.
- React Compiler is enabled through `babel-plugin-react-compiler` in `vite.config.js`.
- Tailwind CSS v4 is enabled via `@tailwindcss/vite` plugin. Global styles are in `src/index.css`.
- Path alias `@` is configured in `vite.config.js` to resolve to `./src`.

## Project Structure (key files)
```
.
├─ AUTH_SETUP.md                # How to integrate the auth flow with your backend
├─ database_schema.sql          # Database schema reference (if applicable to your backend)
├─ index.html                   # Vite entry HTML (loads /src/main.jsx)
├─ vite.config.js               # Vite + React + Tailwind + alias config
├─ package.json                 # Scripts and dependencies (name: "Monivoza")
├─ src/
│  ├─ App.jsx                   # Routes and app providers (Auth, Query, Router)
│  ├─ Layout.jsx                # App layout (navigation, header, etc.)
│  ├─ index.css / App.css       # Global and component styles
│  ├─ api/
│  │  └─ authService.js         # Auth API client (uses VITE_API_URL)
│  ├─ lib/
│  │  ├─ AuthContext.jsx        # Authentication context + hooks
│  │  ├─ NavigationTracker.jsx  # Tracks route changes
│  │  ├─ PageNotFound.jsx       # 404 page
│  │  └─ query-client.js        # React Query client instance
│  ├─ pages/                    # Top-level routed pages
│  │  ├─ Landing.jsx
│  │  ├─ Login.jsx / Register.jsx
│  │  ├─ Dashboard.jsx
│  │  ├─ Accounts.jsx / Transactions.jsx
│  │  ├─ Loans.jsx / LoanApply.jsx / LoanDetails.jsx
│  │  ├─ Settings.jsx
│  │  ├─ AdminDashboard.jsx / AdminUsers.jsx / AdminLoans.jsx
│  ├─ components/
│  │  ├─ UserNotRegisteredError.jsx
│  │  ├─ dashboard/             # Dashboard widgets
│  │  ├─ loans/                 # Loan cards/calculator
│  │  └─ ui/                    # Reusable UI primitives (button, input, card, etc.)
└─ public/                      # Static assets
```

## Authentication Integration
This repo includes a ready-made authentication flow. To connect it to your backend API, follow the step-by-step guide in `AUTH_SETUP.md`. In short, set `VITE_API_URL` and update `src/api/authService.js` endpoints to match your server.

## Deployment
- Build with `npm run build` – output is written to `dist/`.
- Serve `dist/` with any static host (Netlify, Vercel, Cloudflare Pages, Nginx, etc.).
- Ensure environment variables are injected at build time (set `VITE_API_URL` in your hosting provider’s build settings if you are not using the default).

## Troubleshooting
- Dev server won’t start / wrong Node version: verify Node 18+ with `node -v`.
- API calls fail locally: set `VITE_API_URL` in `.env` to your backend URL and ensure CORS is configured server-side.
- Path imports like `@/pages/...` fail: ensure you’re running through Vite and not a raw Node runner; the alias is configured in `vite.config.js`.
- Styles not applying: confirm Tailwind plugin is active (see `vite.config.js`) and classes exist in your markup.

## License
No license specified. Add a license of your choice (e.g., MIT) if this project is to be open-sourced.

## 👨‍💻 Author

**Tosin Adewale**  
📱 WhatsApp: [Chat with me](https://wa.me/2348068957966)<br>
📧 Email: adewaletosin0808@gmail.com

