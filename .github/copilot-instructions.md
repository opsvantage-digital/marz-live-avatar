# Copilot Instructions for marz-live-avatar

## Project Overview
- **Purpose:** Live AI avatar video chat app (Marz) with voice, video, and emotional intelligence, built with React, Vite, and TypeScript.
- **Key Features:**
  - Real-time video chat with AI avatar (Marz)
  - Google GenAI (Gemini) integration for conversation
  - Voice/mic/camera activation, fallback UI, and error handling
  - Cinematic, glowing UI with Tailwind CSS and custom styles
  - All static assets (images/audio) in `public/`

## Architecture & Key Files
- **Entry:** `index.tsx` (mounts `App` or React Router routes)
- **Main UI:** `App.tsx` (homepage, modal trigger, layout)
- **Modal:** `components/MarzModal.tsx` (core chat, media, avatar, settings)
- **Avatar:** `components/Avatar.tsx` (glowing, animated avatar)
- **Voice Test:** `components/VoiceCapture.tsx` (direct camera/mic test, whisper audio)
- **Avatar Config:** `utils/avatar-config.ts` (avatar URLs, fallback logic)
- **Media Debug:** `utils/media-debug.ts` (device diagnostics, error parsing)
- **Global Styles:** `index.css` (Tailwind directives, custom animations)
- **Static Assets:** `public/` (e.g., `/avatar-headshot.png`, `/hello-papa.mp3`)
- **Build Config:** `vite.config.ts` (outDir: `dist`, React plugin)
- **Routing:** React Router, with Vercel rewrite in `vercel.json`

## Developer Workflows
- **Local Dev:**
  - `npm install` (install deps)
  - `npm run dev` (start Vite dev server)
  - `npm run build` (build for production)
- **Environment:**
  - Set `GEMINI_API_KEY` in `.env.local` for Google GenAI
- **Deployment:**
  - Vercel auto-deploys from `dist/` (set Output Directory to `dist`)
  - `vercel.json` must rewrite all routes to `/index.html` for React Router

## Project Conventions & Patterns
- **Component Structure:** Flat, with `components/` and `utils/` at root (no `src/` for main code)
- **Static Asset References:** Always use `/filename.ext` (e.g., `/avatar-headshot.png`)
- **Modal/Avatar:** Use Tailwind for layout, custom CSS for glow/animation
- **Error Handling:** Non-blocking, user-friendly, with debug panel always accessible
- **Hotkeys:** See README for voice/video/chat toggles
- **No imports for static assets**—reference directly from `public/`

## Integration Points
- **Google GenAI:** via `@google/genai` (see `MarzModal.tsx`)
- **Vercel Blob:** (optional) for remote avatar hosting, but local `/public` preferred
- **Vercel Hosting:** Requires correct rewrite rule and output dir

## Example Patterns
- Avatar fallback: see `utils/avatar-config.ts` and `components/Avatar.tsx`
- Modal open/close: see `App.tsx` and `components/MarzModal.tsx`
- Voice activation: see `components/VoiceCapture.tsx` (plays `/hello-papa.mp3` on success)

---

If you add new features, update this file with new conventions or integration details. For any unclear patterns, ask the user for clarification.
