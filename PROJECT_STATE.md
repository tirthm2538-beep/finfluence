# PROJECT_STATE.md — FinFluence

## Goal
A mobile-style web app that teaches Gen Z financial literacy (SIP, mutual funds, 
crypto, stock market, etc.) through short, swipeable "story cards" with a fun, 
meme-friendly tone and quick quizzes — built to connect science, arts, and 
commerce students, and to pitch to a software/trading company CEO.

## Repository
- GitHub: https://github.com/tirthm2538-beep/finfluence (Branch: `main`)

## Tech stack
- Frontend: Next.js (React 19, App Router) + Tailwind CSS v4 + Lucide Icons — dual-mode responsive layout: full widescreen desktop dashboard ($\ge 1024$px) + native swipeable story UI for mobile (<1024px)
- Backend: Python + FastAPI + Pydantic v2 + Uvicorn — live on Render at `https://finfluence-d420.onrender.com`
- Database & Auth: Supabase (`@supabase/supabase-js` v2) — authentication, user profiles, daily streak engine, card completion tracking, bookmarks, virtual portfolios
- Deploy: Vercel (frontend) + Render (backend)

## Tool workflow
- Claude/ChatGPT: planning, content design, debugging, reviewing output
- Antigravity (Gemini, no usage limit): main heavy coding/build work
- ChatGPT: backup only, for single stuck errors

## Decisions made so far
- Project name: FinFluence
- Core format: swipeable story-style cards, one concept per card, Gen Z tone, 
  quiz after each card
- Two content tracks:
  1. Core finance literacy (SIP, mutual funds, crypto, compound interest, 
     inflation, credit score, EMI, emergency fund, risk/return, diversification, 
     crypto frontier) — 10 complete concepts
  2. Stock market literacy — What is a stock, NSE vs BSE, Nifty/Sensex, IPO, 
     bull/bear market, candlesticks, support/resistance, volume, dividends, 
     investing vs trading — EDUCATION/TERMS ONLY, never stock-picking tips or 
     buy/sell signals — 10 complete concepts
- Voice/tone LOCKED with example card — relatable hook, plain explanation, one 
  grounded analogy, short quiz. No forced slang.
- Responsive & Desktop Web Overhaul (Phase 10):
  - **Full-Width Desktop Web Platform ($\ge 1024$px)**:
    - Completely eliminates the narrow smartphone confinement on laptop and desktop monitors.
    - Full-width top navigation bar featuring glowing FinFluence Web Edition branding, direct Story Cards / Practice Portfolio switcher, Live API connection indicator, Daily Streak badge (`🔥 X Days`), Total XP badge (`✨ Y XP`), User profile chip, and a "📱 Phone View" simulator toggle.
    - Left Sidebar Navigator (280px-350px): User Level / Rank badge ("Finance Novice", "Market Strategist", "Wall Street Prodigy"), XP progress bar, track switcher (All 20, Core Finance, Stock Market, Saved Bookmarks), search bar, and full concept jump checklist with completion checkmarks (`✅ Done`) and saved stars.
    - Center Stage Card Experience: 2x2 modular card grid with large, readable desktop typography (`text-2xl lg:text-3xl font-black` titles, `text-base lg:text-lg leading-relaxed` hooks & explanations, comfortable `lg:py-3 lg:px-4` quiz buttons with instant XP reward feedback).
    - Desktop Bottom Navigation Bar: Previous / Next concept buttons, interactive concept dots, and keyboard navigation hints (`← / →` arrows).
  - **Practice Portfolio Simulator Desktop Dashboard**:
    - Expands into a widescreen 2-column financial dashboard (`max-w-6xl`).
    - Left Column: Simulated Net Worth (₹1,00,000), total P&L (% and ₹), interactive SVG performance trend chart, cash vs. invested capital split, CEO brokerage Demat partner tie-in banner, and 1-click Reset button.
    - Right Column: Watchlist of 6 fictional simulated instruments (`SIM-INDEX50`, `SIM-CHAIBYTES`, `SIM-GREENWATT`, etc.) with real-time prices, 24h change %, and quick BUY/SELL buttons, plus active holdings management table.
  - **Mobile Phone Feed Intact (< 1024px)**:
    - 100% native mobile experience preserved: smooth vertical CSS scroll snapping, compact typography, segmented progress bars, and bottom navigation controls.
  - **Interactive Dual-Mode Toggle for Desktop Users & Reviewers**:
    - Users on laptops/desktops can click "📱 Phone View" anytime to preview the smartphone story feed inside a realistic iPhone frame, and click "🖥️ Switch to Desktop View" to return.
- Full-Stack Integration Architecture (Phase 4):
  - Next.js frontend connects live to Python FastAPI backend (local or production `https://finfluence-d420.onrender.com`)
  - Visual status pill in header: `🟢 Live API Connected` when online, or `🟡 Offline Mode` when running disconnected
  - Graceful resilience: if backend is unreachable, frontend displays a friendly error screen with quick retry and a one-click button to load local offline backup cards (`sampleCards.ts`)
- Backend Endpoints (Live on Render):
  - `GET /health` (status check, version, total cards count)
  - `GET /cards` (returns all 20 cards, supports optional `?track=` filter)
  - `GET /cards/{id}` (fetches single card by ID with 404 handling)
  - `GET /tracks` (lists available tracks and card counts)
  - `POST /cards/generate` (AI card generator with locked voice/tone prompts)
  - Interactive Swagger API docs at `https://finfluence-d420.onrender.com/docs`
- Supabase Authentication & Real-Time Progress Architecture (Phase 5):
  - Next.js client integration via `@supabase/supabase-js` in `src/lib/supabase.ts`
  - User progress tracking engine in `src/lib/userProgress.ts`:
    - Tracks completed cards in `completed_cards` table (`user_id`, `card_id`, `track`, `score: 10`, `completed_at`)
    - Tracks daily learning streaks and XP in `profiles` table (`current_streak`, `longest_streak`, `xp_points`, `last_active_date`)
    - UTC calendar day arithmetic to prevent timezone or DST drift
    - Real-time bookmarking toggles synced to `bookmarks` table (`user_id`, `card_id`, `saved_at`)
  - "Continue as Guest / Pitch Demo" 1-click option guarantees 100% demo-readiness with `localStorage` persistence.
- CEO Pitch & Partner Guide:
  - Full pitch guide created in `PITCH_DECK_GUIDE.md` detailing the 3-minute live walkthrough, student CAC reduction thesis, and objection handling for brokerage executives.
- Deployment Status:
  - Backend: **LIVE** on Render at `https://finfluence-d420.onrender.com`.
  - Frontend: Committed to GitHub, ready for 1-click Vercel import with Root Directory set to `frontend`.

## Locked example card (template for all cards)
Concept: What is a SIP?
Hook: You know how you don't notice ₹50 missing from your wallet, but you'd 
definitely notice ₹5,000 gone in one shot?
Explanation: A SIP (Systematic Investment Plan) is investing a small fixed 
amount every month into a mutual fund instead of a lump sum. Small amounts 
feel like nothing, but compounding over years turns it into real money.
Analogy: It's like a gym membership for your money — results come from 
showing up consistently, not from one big effort.
Quiz: What's the main idea behind a SIP? 
(A) Invest a huge amount once
(B) Invest small amounts regularly ✅
(C) Only invest when the market is doing well

## Current Status
- **Phase 1 (Content Tone & Structure)**: LOCKED.
- **Phase 2 (Content Library Population)**: COMPLETE (all 20 cards drafted and loaded across Track 1 and Track 2).
- **Phase 3 (Frontend Groundwork & Card UI)**: COMPLETE & VERIFIED.
- **Phase 4 (Backend API & Full-Stack Integration)**: COMPLETE & VERIFIED LIVE.
  - FastAPI app running on `http://127.0.0.1:8000` & Render `https://finfluence-d420.onrender.com`.
  - Loading, error, and offline fallback (`sampleCards.ts`) states fully operational.
- **Phase 5 (Database & Auth & Real-Time Progress)**: COMPLETE & VERIFIED.
  - Supabase client and auth flow (Sign in, Sign up, Sign out) fully wired into Next.js.
  - Live Supabase persistence for quiz completions, streaks, XP, and bookmarks.
  - Guest demo mode flawlessly operational with offline `localStorage` fallback.
- **Phase 6 (Business Tie-In / Practice Portfolio Simulator)**: COMPLETE & TESTED.
  - ₹1,00,000 starting virtual balance with Supabase `virtual_portfolios` persistence.
  - 6 fictional simulated instruments with random-walk price fluctuations.
  - Instant BUY and SELL simulated trading with full portfolio accounting and P&L calculation.
  - Responsive SVG trend chart displaying portfolio value over time.
  - Strategic CEO partnership pitch modal.
- **Phase 7 (Backend Deployment)**: COMPLETE & LIVE on Render.
- **Phase 8 (Frontend Vercel Deployment)**: READY & VERIFIED.
  - Removed root `vercel.json` to prevent path doubling.
  - Environment variables documented in `frontend/.env.example`.
- **Phase 9 (Pitch Preparation)**: COMPLETE in `PITCH_DECK_GUIDE.md`.
- **Phase 10 (Complete Desktop & Laptop Web Overhaul)**: COMPLETE & VERIFIED.
  - Fully transformed desktop screens ($\ge 1024$px) from cramped phone mockup to premier widescreen web platform.
  - Created `DesktopStoryDashboard.tsx` with top navigation bar, left sidebar (user ranking, track filtering, concept search, quick jump checklist), and spacious center stage with 2x2 modular card grid.
  - Scaled typography responsively (`text-2xl` to `text-3xl` headings, `text-base` body text, large interactive quiz buttons).
  - Enhanced `PortfolioView.tsx` into a widescreen 2-column desktop financial dashboard.
  - Redesigned `AuthScreen.tsx` into an expansive 2-column hero showcase on desktop.
  - Preserved 100% native mobile experience on viewports `< 1024px`.
  - Verified across multiple resolutions with captured screenshots:
    - 1440x900 desktop feed (`desktop-after-feed-1440.png`)
    - 1920x1080 full HD feed (`desktop-after-feed-1920.png`)
    - 1366x768 standard laptop (`desktop-after-feed-1366.png`)
    - 1440x900 stock market track (`desktop-after-stockmarket-1440.png`)
    - 1440x900 practice portfolio (`desktop-after-portfolio-1440.png`)
    - 1440x900 desktop auth screen (`desktop-after-auth-1440.png`)
    - 1440x900 desktop phone simulator mode (`desktop-after-phoneview-1440.png`)
    - 390x844 mobile phone feed (`desktop-after-mobile-390.png`)
  - Production build (`npm run build`) compiles cleanly in 2.1s with 0 errors.

## Next steps
1. **Deploy Frontend on Vercel**:
   - Go to [vercel.com](https://vercel.com) -> New Project -> Import `tirthm2538-beep/finfluence`.
   - Set Root Directory to `frontend`.
   - Add the 3 environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`).
   - Click Deploy.
2. **Execute CEO Pitch**: Use `PITCH_DECK_GUIDE.md` for your live presentation and demonstration!
