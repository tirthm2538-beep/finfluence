# PROJECT_STATE.md — FinFluence

## Goal
A mobile-style web app that teaches Gen Z financial literacy (SIP, mutual funds, 
crypto, stock market, etc.) through short, swipeable "story cards" with a fun, 
meme-friendly tone and quick quizzes — built to connect science, arts, and 
commerce students, and to pitch to a software/trading company CEO.

## Tech stack
- Frontend: Next.js (React 19, App Router) + Tailwind CSS v4 + Lucide Icons — swipeable card/story UI (Port 3000 locally, deploying to Vercel)
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
- Visual & Responsive UI Architecture:
  - Mobile-first vertical story feed inspired by TikTok / Instagram Stories
  - CSS Scroll Snap (`snap-y snap-mandatory`) for 60fps native swiping, touch gestures, and keyboard navigation (↑ / ↓ arrows)
  - Instagram-style segmented progress bar at top showing story progression
  - Fluid responsive smartphone mockup container (`md:max-h-[calc(100dvh-70px)]` and `flex-1 min-h-0`) that automatically adapts to smaller laptop screens without clipping
  - 4-part modular card architecture: Hook Section, Plain English Explanation, Grounded Analogy, and Interactive Quiz
  - Proportional typography and compact card paddings (`text-[10px] sm:text-[11px]`, `p-1.5 sm:p-2`, `break-words`, `min-w-0`)
  - Instant visual feedback on quiz selection (green glow for correct answer + XP reward, red highlight for incorrect options)
  - Shareable card modal feature implemented (lets users copy formatted summary or share natively)
- Full-Stack Integration Architecture (Phase 4):
  - Next.js frontend connects live to Python FastAPI backend (local or production `https://finfluence-d420.onrender.com`)
  - Visual status pill in header: `🟢 Live API (Render)` when connected, or `🟡 Offline Backup Mode` when running disconnected
  - Graceful resilience: if backend is unreachable, frontend displays a friendly error screen with quick retry and a one-click button to load local offline backup cards (`sampleCards.ts`)
  - Server orchestration: dual-terminal option or single command `npm run dev:all` via `concurrently`
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
    - Calendar day arithmetic with UTC day boundaries to calculate daily streaks without timezone or DST drift
    - Real-time bookmarking toggles synced to `bookmarks` table (`user_id`, `card_id`, `saved_at`)
  - Header Display:
    - Visible daily streak badge (`🔥 X day(s) streak`) in header and on each card
    - Active XP counter (`✨ X XP`) next to user identifier
    - Concept completion badge (`Done` with checkmark) for mastered cards
  - "Continue as Guest / Pitch Demo" 1-click option guarantees 100% demo-readiness:
    - Skips Supabase network calls and persists streaks, XP, completions, and bookmarks in `localStorage`
    - Real logged-in users sync to Supabase PostgreSQL database tables
- Business Tie-in: Practice Portfolio Simulator (CEO Pitch Feature):
  - Dedicated virtual sandbox accessible via top desktop tab switcher and phone header shortcut (`₹1L Sandbox`)
  - Each user starts with ₹1,00,000 virtual balance stored in Supabase `virtual_portfolios` table (with `localStorage` fallback for Guest demo mode)
  - 6 educational simulated instruments with made-up names to avoid confusion with real assets:
    - `SIM-INDEX50` (Top 50 Simulated Index ETF)
    - `SIM-CHAIBYTES` (ChaiBytes Cloud Tech)
    - `SIM-GREENWATT` (GreenWatt Renewables)
    - `SIM-METROMART` (MetroMart Quick Retail)
    - `SIM-VAULTBANK` (Vault Horizon Bank)
    - `SIM-AURUMGOLD` (Aurum Virtual Gold Hedge)
  - Organic simulated price movements with random walk drift on each visit/session
  - Simulated BUY and SELL order execution with real-time balance calculations, weighted average buy pricing, and instant P&L updates
  - Clean summary card with live net worth, cash balance, invested capital, P&L (₹ and %), and responsive SVG trend chart
  - Clear and unambiguous PRACTICE/SIMULATION notices and disclaimer badges
  - Interactive B2B partner pitch modal demonstrating how the sandbox funnels risk-educated students into 1-click brokerage Demat account onboarding
  - One-click account reset button to restore fresh ₹1,00,000 balance
- CEO Pitch & Partner Guide:
  - Full pitch guide created in `PITCH_DECK_GUIDE.md` detailing the 3-minute live walkthrough, student CAC reduction thesis, and objection handling for brokerage executives.
- Deployment Status:
  - Backend: **LIVE** on Render at `https://finfluence-d420.onrender.com`.
  - Frontend: Prepared for Vercel deployment with monorepo root settings, environment documentation in `.env.example`, and clean production compilation (`npm run build` passing in 1.9s).

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
  - Next.js 16 + React 19 + Tailwind CSS configured in `frontend/`.
  - Responsive layout verified across laptop, desktop, and mobile viewports.
- **Phase 4 (Backend API & Full-Stack Integration)**: COMPLETE & VERIFIED LIVE.
  - FastAPI app running on `http://127.0.0.1:8000`.
  - Next.js frontend dynamically fetching live cards from `http://localhost:8000/cards`.
  - Loading, error, and offline fallback (`sampleCards.ts`) states fully operational.
  - `POST /cards/generate` endpoint available for AI content generation.
- **Phase 5 (Database & Auth & Real-Time Progress)**: COMPLETE & VERIFIED.
  - Supabase client and auth flow (Sign in, Sign up, Sign out) fully wired into Next.js.
  - Live Supabase persistence for quiz completions (`completed_cards`), daily streaks and XP (`profiles`), and saved cards (`bookmarks`).
  - Visual streak badge (`🔥 X day(s) streak`), XP pill, and card completion status active in the UI.
  - Guest demo mode flawlessly operational with offline `localStorage` fallback.
- **Phase 6 (Business Tie-In / Practice Portfolio Simulator)**: COMPLETE & TESTED.
  - ₹1,00,000 starting virtual balance with Supabase `virtual_portfolios` persistence.
  - 6 fictional simulated instruments with random-walk price fluctuations.
  - Instant BUY and SELL simulated trading with full portfolio accounting and P&L calculation.
  - Responsive SVG trend chart displaying portfolio value over time.
  - Prominent PRACTICE/SIMULATION notices and disclaimer badges.
  - Strategic CEO partnership pitch modal.
- **Phase 7 (Backend Deployment)**: COMPLETE & LIVE.
  - Backend deployed to Render at `https://finfluence-d420.onrender.com`.
  - Swagger UI live at `https://finfluence-d420.onrender.com/docs`.
- **Phase 8 (Frontend Vercel Deployment)**: READY FOR USER DEPLOY.
  - Frontend environment variables configured to point to Render backend.
  - `frontend/.env.example` thoroughly documented with Supabase and Render keys.
  - Production build (`npm run build`) compiling cleanly in 1.9s with 0 errors.
- **Phase 9 (Pitch Preparation)**: COMPLETE.
  - Executive pitch deck and demo script written in `PITCH_DECK_GUIDE.md`.

## Next steps
1. **Deploy Frontend to Vercel**: Connect GitHub repository to Vercel, set Root Directory to `frontend`, add the 3 environment variables, and deploy.
2. **Execute CEO Pitch**: Use `PITCH_DECK_GUIDE.md` for the live meeting and demo walkthrough.
