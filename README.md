# DogLog

DogLog is a mobile-first, installable web app for recording dogs, walks, training sessions and everyday progress. It uses React, Vite and Supabase.

## Start locally

1. Install Node.js 20 or newer.
2. In Supabase's SQL Editor, run `supabase/schema.sql` once.
3. Ensure `.env` contains the project URL and publishable key:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-key
   ```

4. Install and run:

   ```bash
   npm install
   npm start
   ```

Open the local URL printed in the terminal. To test on a phone, connect it to the same Wi-Fi and open the **Network** URL shown by Vite.

## Supabase authentication

Under **Authentication → URL Configuration**:

- Set the Site URL to `http://localhost:5173` for local development.
- Add `http://localhost:5173/**` as a redirect URL.
- Add the deployed web address before publishing.

Use the publishable/anon key in the browser. Never place the secret or `service_role` key in `.env`. Access is protected by the row-level security policies in `supabase/schema.sql`.

## Install on a phone

After deploying over HTTPS:

- Android Chrome: open the browser menu and select **Install app**.
- iPhone Safari: tap **Share**, then **Add to Home Screen**.

The app shell is cached for launch and navigation. Supabase-backed data still requires a network connection.

## Commands

```bash
npm start       # Development server available on the local network
npm run build   # Production build
npm run preview # Preview the production build
npm run lint    # Code checks
npm test        # Unit tests
```

## Project structure

```text
public/           # Static assets and Netlify SPA redirects
src/
  components/     # Shared UI (one file per component)
  hooks/          # Auth session and other React hooks
  screens/        # Route screens (auth/ for guest flows)
  services/       # Supabase data access
  store/          # Zustand app state
  test/           # Vitest setup
  types/          # Shared JSDoc / type helpers
  utils/          # Dates, analytics helpers, unit tests
supabase/         # Schema and permission SQL
```

## Deployment

The `dist` directory can be deployed to Netlify, Vercel, Cloudflare Pages or another static host. Build with `npm run build`, configure the two `VITE_SUPABASE_*` environment variables on the host, and add the deployed URL to Supabase Authentication redirect URLs. `public/_redirects` provides SPA routing support on Netlify.
