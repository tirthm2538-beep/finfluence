# PROJECT_STATE.md — FinFluence

## Goal
A mobile-style web app that teaches Gen Z financial literacy (SIP, mutual funds, 
crypto, stock market, etc.) through short, swipeable "story cards" with a fun, 
meme-friendly tone and quick quizzes — built to connect science, arts, and 
commerce students, and to pitch to a software/trading company CEO.

## Repository & Live Deployments
- GitHub: https://github.com/tirthm2538-beep/finfluence (Branch: `main`)
- Frontend (Live on Vercel): https://finfluence-theta.vercel.app
- Backend (Live on Render): https://finfluence-d420.onrender.com

## Tech stack
- Frontend: Next.js (React 19, App Router) + Tailwind CSS v4 + Lucide Icons — dual-mode responsive layout: full widescreen desktop dashboard ($\ge 1024$px) + native swipeable story UI for mobile (<1024px), integrated Theme Engine (Light Mode: White / Cream / Rich Green & Dark Mode: Obsidian / Rich Green)
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
- Color Palette & Theme Engine (Phase 11):
  - **Light Mode (Default)**:
    - Main Background: Clean white / off-white (`#fbfbf9`, `bg-white`).
    - Surfaces & Card Sections: Warm cream tints (`#faf8f2`, `#f5f2e7`, `#ede9dc`, `#e3decb`).
    - Primary Accent: Rich trustworthy green (`#059669`, `#047857`) for call-to-action buttons, active indicators, progress bars, daily streak flames, and XP rewards.
  - **Dark Mode**:
    - Deep obsidian (`#020617`, `#0f172a`, `#1e293b`) with vibrant emerald green accents and crisp high-contrast text.
  - **Theme Toggle Component (`ThemeToggle.tsx`)**:
    - Accessible Sun/Moon toggle placed in desktop top navigation and mobile feed header.
    - Persists user preference in `localStorage` under `finfluence_theme`.
    - Supports initial URL parameter override (`?theme=light` or `?theme=dark`).
    - Configured Tailwind v4 `@variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));` in `globals.css` for instant class-based theme switching.
- Desktop Experience Optimization (Phase 11):
  - **Desktop "Phone View" Toggle Removed**: Desktop and laptop users strictly see the premier widescreen dashboard layout. No confusing simulator toggle or cramped mobile mockup on wide screens.
  - **Desktop Dashboard ($\ge 1024$px)**:
    - Full-width top navigation bar featuring FinFluence brand, Story Cards / Practice Portfolio switcher, Live API connection indicator, Daily Streak badge (`🔥 X Days`), Total XP badge (`✨ Y XP`), Theme Toggle button, and User profile pill.
    - Left Sidebar Navigator: Rank progression ("Finance Novice"), completion meter, track filter tabs, search input, and interactive 20-concept jump checklist with completion checkmarks.
    - Center Stage Card Experience: 2x2 modular card grid (Hook, Plain English, Analogy, Quiz check) with spacious typography and instant XP reward feedback.
    - Desktop Bottom Navigation Bar: Previous / Next concept controls, progress dots, and keyboard shortcuts (`← / →`).
- Mobile Phone Feed & Quiz Visibility Optimization (Phases 11 & 12):
  - **All Quiz Options (A, B, C) 100% Visible & Unclipped**:
    - Replaced restrictive `overflow-hidden` with `overflow-visible` on `QuizSection.tsx` and applied `flex-shrink-0 min-h-[34px]` to all option buttons, ensuring options never collapse or get cut off.
    - Optimized mobile vertical rhythm (`p-2 sm:p-2.5` padding and `gap-1.5 sm:gap-2` spacing) to naturally fit the entire story card (Hook, Explanation, Analogy, Quiz with all 3 options, and action footer) within standard mobile viewports (375px to 414px) without requiring initial scrolling.
    - Enabled natural vertical scrolling (`overflow-y-auto no-scrollbar`) on `<section>` so that long explanations or expanded feedback banners can be scrolled cleanly.
    - Verified across multiple cards (#1 SIP, #2 Compounding, #6 Credit Score, #17 Volume) in Light and Dark mode.
- Polished Entrance Animation (Phase 12):
  - Created `OpeningAnimation.tsx`: glowing brand logo, pulse icon, and smooth ~1-second progress bar filling up.
  - Runs briefly on initial load or guest login, fading out cleanly after 1.2s.
  - Completely non-blocking: tap/click anywhere or press any key to skip immediately.
- Full-Stack Integration Architecture (Phase 4):
  - Next.js frontend connects live to Python FastAPI backend (Render: `https://finfluence-d420.onrender.com`).
  - Visual status pill in header: `🟢 Live API Connected` when online, or `🟡 Offline Mode` when running disconnected.
  - Graceful resilience: friendly offline fallback screen with 1-click local backup loader (`sampleCards.ts`).
- Backend Endpoints (Live on Render):
  - `GET /health` (status check, version, total cards count)
  - `GET /cards` (returns all 20 cards, supports optional `?track=` filter)
  - `GET /cards/{id}` (fetches single card by ID with 404 handling)
  - `GET /tracks` (lists available tracks and card counts)
  - `POST /cards/generate` (AI card generator with locked voice/tone prompts)
  - Interactive Swagger API docs at `https://finfluence-d420.onrender.com/docs`
- Supabase Authentication & Real-Time Progress Architecture (Phase 5):
  - Next.js client integration via `@supabase/supabase-js` in `src/lib/supabase.ts`.
  - User progress tracking engine in `src/lib/userProgress.ts`:
    - Tracks completed cards in `completed_cards` table (`user_id`, `card_id`, `track`, `score: 10`, `completed_at`).
    - Tracks daily learning streaks and XP in `profiles` table (`current_streak`, `longest_streak`, `xp_points`, `last_active_date`).
    - UTC calendar day arithmetic to prevent timezone drift.
    - Real-time bookmarking toggles synced to `bookmarks` table.
  - "Continue as Guest / Pitch Demo" 1-click option guarantees 100% demo-readiness with `localStorage` persistence.
- Practice Portfolio Simulator (Phase 6 & Phase 14):
  - ₹1,00,000 starting virtual balance with Supabase `virtual_portfolios` persistence.
  - **19 Realistic Fictional Instruments Across 8 Sectors**:
    - Indices: `SIM-NIFTY50X` (Bharat 50 ETF), `SIM-NEXTMID` (NextGen 100 Midcap)
    - IT & Tech: `SIM-BYTECRAFT` (Cloud Solutions), `SIM-CYBERKAVACH` (Infosec Systems), `SIM-DATASTRIDE` (Analytics & AI)
    - Banking & Finance: `SIM-APEXBANK` (Retail & Corp Bank), `SIM-VAULTNBFC` (Credit & Lending), `SIM-FINPULSE` (Digital Payments)
    - FMCG & Consumer: `SIM-DESIHARVEST` (Foods & Agri), `SIM-CHAIBREWS` (Beverages), `SIM-VELVETCARE` (Personal Care)
    - Auto & EV: `SIM-VOLTEV` (Electric Motors), `SIM-GATIAUTO` (Commercial Vehicles)
    - Pharma & Healthcare: `SIM-AUSHADH` (Formulations & Generics), `SIM-SANJEEV` (Hospital Networks)
    - Energy & Infra: `SIM-GREENWATT` (Clean Energy), `SIM-URJAGRID` (Power Transmission), `SIM-SETUINFRA` (Highways & Ports)
    - Commodities: `SIM-SKYLINE` (Real Estate REIT), `SIM-AURUMGOLD` (Sovereign Gold ETF)
  - **TradingView Lightweight Charts (`lightweight-charts@^5.3.0`)**:
    - Interactive 45-day historical OHLCV chart per stock with Candlestick and Area/Line modes.
    - Volume histogram series aligned below price action.
    - Live crosshair tooltip with dynamic Open, High, Low, Close, and Volume hover readout.
    - Dynamic responsive resizing (`ResizeObserver`) and automatic Light / Dark theme palette switching.
  - **Realistic Seeded OHLCV Candlestick Engine (`portfolioService.ts`)**:
    - Mulberry32 seeded deterministic PRNG for reproducible 45-day trading history per stock.
    - Assigned distinct financial character: beta ($\beta$ 0.45 to 1.70), annual volatility (14% to 48%), and sector cyclical swings.
  - **Interactive Stock Detail & Practice Order Ticket Modal (`StockDetailModal.tsx`)**:
    - 52-week high/low, day range, volatility beta stats, and educational FinFluence concept tie-in.
    - Real-time BUY / SELL practice order ticket with quantity presets (`+1`, `+5`, `+10`, `Max/All`) and balance checks.
  - **Watchlist Navigation & Filters**:
    - 10 sector filter chips (`All Sectors (20)`, `Indices (2)`, `IT & Tech (3)`, `Banking & Finance (3)`, etc.) with live counts.
    - Real-time instant search bar matching symbol, company name, or sector.
  - Strategic CEO partnership pitch modal with student CAC reduction thesis.
- CEO Pitch & Partner Guide:
  - Full pitch guide created in `PITCH_DECK_GUIDE.md` detailing the 3-minute live walkthrough, student CAC reduction thesis, and brokerage executive partner hooks.
- Deployment Status:
  - Frontend: **LIVE** on Vercel at `https://finfluence-theta.vercel.app`.
  - Backend: **LIVE** on Render at `https://finfluence-d420.onrender.com`.

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
- **Phase 5 (Database & Auth & Real-Time Progress)**: COMPLETE & VERIFIED.
- **Phase 6 (Business Tie-In / Practice Portfolio Simulator)**: COMPLETE & TESTED.
- **Phase 7 (Backend Deployment)**: COMPLETE & LIVE on Render.
- **Phase 8 (Frontend Vercel Deployment)**: COMPLETE & LIVE on Vercel at `https://finfluence-theta.vercel.app`.
- **Phase 9 (Pitch Preparation)**: COMPLETE in `PITCH_DECK_GUIDE.md`.
- **Phase 10 (Desktop Web Dashboard)**: COMPLETE & VERIFIED.
- **Phase 11 (Color Redesign, Theme Engine, Desktop Streamline & Mobile Fixes)**: COMPLETE & VERIFIED.
- **Phase 12 (Quiz Option Full-Visibility Fix & Opening Animation)**: COMPLETE & VERIFIED.
  - All quiz options (A, B, C) render with full visibility on every card across desktop and mobile.
  - Tested and verified on multiple cards (#1 SIP, #2 Compounding, #6 Credit Score, #17 Volume) in Light and Dark mode.
  - Opening entrance animation added with smooth brand reveal and 1-click skip.
  - Production build (`npm run build`) compiles cleanly in 6.2s with 0 errors.
- **Phase 13 (Desktop Layout 1366x768 Overlap Elimination & Per-Grid-Cell Scrollability)**: COMPLETE & VERIFIED.
  - **Zero Bottom Bar Overlap on Laptop Screens**: Eliminated the layout bug on 1366x768 screens (and constrained 1366x628 laptop browser viewports) where the fixed bottom navigation bar previously overlapped Option B/C of the Quick Quiz Check.
  - **Flexbox `min-h-0` Boundary**: Added `min-h-0` to the desktop center canvas container and refined vertical rhythm (`h-12 lg:h-14` header and footer), mathematically bounding the canvas strictly above the footer (`canvasBottom === footerTop`).
  - **Modular Per-Cell Scrollability**: Updated the 2x2 grid in `StoryCard.tsx` so that each of the four cells (The Hook, In Plain English, Grounded Analogy, and Quick Quiz Check) has its own independent boundary with `overflow-y-auto scrollbar-thin`. If any concept has unusually long content or feedback banners, the cell scrolls cleanly within its own borders without expanding the card or distorting the grid.
  - **Vertical Rhythm Optimization**: Compacted card vertical padding, title sizing (`text-lg lg:text-xl`), and quiz option buttons (`min-h-[32px] lg:min-h-[34px]`) so that cards fit completely on screen with generous clearance (+149px to +218px at 1366x768, and +27px to +78px even on 1366x628) with zero initial scrolling required.
  - **Cross-Card Verification at 1366x768**: Tested and verified across multiple cards with varying text lengths (Card #1 SIP: +218px clearance, Card #2 Compounding: +200px clearance, Card #6 Credit Score: +180px clearance, Card #17 Support & Resistance Dark Mode: +162px clearance).
  - **Custom Sleek Scrollbars**: Added `.scrollbar-thin` utility classes to `globals.css` providing a subtle, modern scrollbar across webkit and Firefox.
- **Phase 14 (TradingView Lightweight Charts, 19 Fictional Sector Instruments & OHLC Candlestick Engine)**: COMPLETE & VERIFIED.
  - **TradingView Integration**: Installed and configured `lightweight-charts@^5.3.0` powering responsive candlestick charts, volume histograms, and area line charts with FinFluence dynamic theme palette adaptation.
  - **19 Simulated Market Instruments**: Expanded from 6 to 19 distinct fictional instruments strictly using the mandatory `SIM-` prefix across 8 Indian sectors (Indices, IT & Tech, Banking & Finance, FMCG & Consumer, Auto & EV, Pharma & Healthcare, Energy & Infra, Commodities).
  - **Realistic Seeded OHLCV Candlestick Engine**: Built Mulberry32 seeded deterministic PRNG generating 45 trading days of realistic historical daily candles with distinct beta, volatility, and sector cycles.
  - **Sector Filters & Search**: Implemented 10 sector chips with dynamic counts and instant search bar matching tickers, names, and sectors.
  - **Interactive Stock Detail Modal (`StockDetailModal.tsx`)**: Full TradingView chart modal with candlestick/area toggles, live crosshair OHLC tooltip, 52W range, volatility character, educational concept tie-in, and practice BUY/SELL order ticket with quick quantity buttons (`+1`, `+5`, `+10`, `Max/All`).
  - **Single Responsive Instance Architecture**: Refactored `src/app/page.tsx` so that `PortfolioView` renders once as a unified responsive component across all viewport sizes, eliminating duplicate React component trees.
  - **Production Build & Verification**: Next.js 16.4.5 Turbopack production build succeeds with 0 errors; visually verified with screenshots in Light and Dark mode on both Desktop (1366x768) and Mobile (390x844).

## Next steps
1. **Execute CEO Pitch**: Use `PITCH_DECK_GUIDE.md` for live presentation and demonstration to brokerage executives at `https://finfluence-theta.vercel.app`.
2. **Collect Student Feedback**: Share `https://finfluence-theta.vercel.app` with science, arts, and commerce college cohorts to test engagement, quiz completion rates, and streak retention.
3. **Expand Card Library**: Plan Track 3 concepts (Mutual Fund Direct vs Regular, Taxation & LTCG, Advanced Options & Futures basics).
