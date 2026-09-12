# Life RPG — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Date:** 2026-09-12  
> **Status:** Draft — Pending Approval  

---

## 1. Executive Summary

**Life RPG** is a full-stack web application that gamifies real-world productivity by transforming everyday tasks into an RPG progression system. Users create a character, complete "Quests" (tasks), earn XP and Gold, level up attributes (Wisdom, Vitality, Craft), purchase items from a "Market" (shop), and watch their cozy lo-fi study room evolve visually as they progress.

The product targets productivity-minded individuals (students, remote workers, habit builders) who respond to game-like reward loops. All progression math is computed server-side to ensure integrity, and data persists across devices via a real PostgreSQL database.

---

## 2. Problem Statement

Traditional to-do apps lack emotional payoff. Users create tasks, check them off, and feel… nothing. Gamification apps exist but most are mobile-only, lack real persistence, or feel generic. **Life RPG** solves this by:

1. Making task completion *feel* rewarding — animated XP gains, level-ups with confetti, a room that visually grows.
2. Providing real cross-device persistence — not localStorage, not local files.
3. Being fully web-based, responsive, and accessible.
4. Enforcing honest progression via server-side anti-cheat.

---

## 3. Target Users

### 3.1 Primary Persona — "The Aspiring Adventurer"
- **Age:** 18–35
- **Profile:** Student or remote worker who struggles with task management motivation
- **Needs:** A system that makes productivity feel like progress, not a chore
- **Tech comfort:** Moderate — uses web apps daily, expects modern UX

### 3.2 Secondary Persona — "The Habit Builder"
- **Age:** 25–45
- **Profile:** Professional building daily habits (exercise, reading, meditation)
- **Needs:** Streak tracking, daily/habit task types, gentle accountability
- **Tech comfort:** High — expects keyboard shortcuts, responsive design

### 3.3 Tertiary Persona — "The Completionist"
- **Age:** 16–30
- **Profile:** Gamer who enjoys unlocking achievements and collecting items
- **Needs:** Market items, visual room upgrades, attribute progression
- **Tech comfort:** High — expects polished animations and zero jank

---

## 4. Theme & Visual Identity

### 4.1 Theme: Cozy Lo-fi Study Room

The entire application is wrapped in a warm, inviting aesthetic inspired by lo-fi hip hop streams and cozy desk setups.

### 4.2 Color Palette

| Token             | Value (approx.)     | Usage                          |
|--------------------|---------------------|--------------------------------|
| `cream`           | `#FDF6E3`           | Page background                |
| `warm-amber`      | `#D4A574`           | Primary accent, buttons        |
| `soft-brown`      | `#8B7355`           | Headings, borders              |
| `dark-brown`      | `#5C4033`           | Body text                      |
| `muted-green`     | `#7D9B76`           | Success states, XP accents     |
| `parchment`       | `#F5E6D3`           | Card backgrounds               |
| `gold`            | `#C9A84C`           | Currency, premium elements     |
| `deep-ember`      | `#B85C38`           | Error/warning states           |

### 4.3 Typography

| Role      | Font         | Weight          | Usage                       |
|-----------|--------------|----------------|-----------------------------|
| Heading   | Fraunces     | 600–800        | Page titles, level-up text  |
| Body      | Inter        | 400–600        | All body text, labels       |
| Mono      | JetBrains Mono | 400          | XP numbers, stats           |

### 4.4 Language Mapping

All UI copy MUST use the RPG terminology consistently:

| Real concept | RPG term       | Example in UI                          |
|-------------|----------------|----------------------------------------|
| Task        | **Quest**      | "Create a new Quest"                   |
| XP          | **XP**         | "+25 XP"                               |
| Currency    | **Gold**       | "You have 120 Gold"                    |
| Attributes  | **Wisdom, Vitality, Craft** | "Wisdom Level 3"          |
| Shop        | **Market**     | "Browse the Market"                    |
| Streak      | **Momentum**   | "7-day Momentum!"                      |

---

## 5. Feature Specifications

### 5.1 Authentication

| Feature | Details |
|---------|---------|
| Sign Up | Email + password. Password hashed with bcrypt. Creates User + Character + 3 Attributes. |
| Log In  | Email + password. Returns httpOnly session cookie. |
| Session | Server-validated on every authenticated request. |
| Logout  | Destroys session, redirects to landing page. |
| Protection | All `/app/*` routes behind middleware. Unauthenticated users redirected to `/login`. |

### 5.2 Quest Management (Task CRUD)

| Operation | Behavior |
|-----------|----------|
| **Create** | Modal form: title (required), description, difficulty (EASY/MEDIUM/HARD), attribute (WISDOM/VITALITY/CRAFT), type (QUEST/DAILY/HABIT), due date (optional). Zod-validated. |
| **Read** | List view with filters by type, attribute, completion status. Sorted by due date, then created date. |
| **Update** | Edit any field except `completedAt`. Inline or modal edit. |
| **Delete** | Soft-confirm dialog. Deletes task and associated completions. |
| **Complete** | Client sends only `taskId`. Server computes XP, gold, streak, applies caps. Animated response on client. |

### 5.3 Progression Engine

> **All computed server-side. Client NEVER sends XP/gold values.**

#### 5.3.1 XP & Leveling
- **Level XP formula:** `xpForLevel(n) = Math.floor(100 * Math.pow(n, 1.5))`
- Character XP and level tracked globally
- On level-up: full-screen celebration, confetti, title upgrade

#### 5.3.2 Difficulty Rewards

| Difficulty | XP Reward | Gold Reward |
|------------|-----------|-------------|
| EASY       | 10 XP     | 5 Gold      |
| MEDIUM     | 25 XP     | 12 Gold     |
| HARD       | 50 XP     | 25 Gold     |

#### 5.3.3 Streak (Momentum) Multiplier

| Streak Length | XP Multiplier |
|---------------|---------------|
| 7 days        | 1.1×          |
| 30 days       | 1.25×         |
| 100 days      | 1.5×          |

#### 5.3.4 Anti-Cheat Rules
- **Daily XP cap:** 500 XP per user per day
- **Rate limit:** 30 completions per user per minute
- **Anti-backfill:** Completing a task > 3 days old → 50% XP
- **Transaction isolation:** All reward logic in a single Prisma transaction

#### 5.3.5 Attribute Progression
- Same XP curve as character leveling
- Each attribute (Wisdom, Vitality, Craft) tracked independently
- Quest completion awards XP to the quest's assigned attribute

### 5.4 Market (Shop)

| Feature | Details |
|---------|---------|
| Browse | Items displayed by category: Theme, Badge, Decor, Consumable |
| Purchase | Deducts gold, creates InventoryItem + Transaction. Server validates sufficient gold. |
| Equip | Toggle equipped status. Only one Theme can be equipped at a time. |
| Inventory | View all owned items in profile or dedicated section. |

### 5.5 Cozy Study Room (Visual Scene)

The room is a visual representation of the user's progress. Elements appear/upgrade at specific levels:

| Level | Room Element                    |
|-------|---------------------------------|
| 1     | Empty desk, dim lamp            |
| 2     | Small plant on desk             |
| 3     | One book on shelf               |
| 5     | Lamp lights up warmly           |
| 7     | Cat appears on windowsill       |
| 10    | Bookshelf fills up              |
| 13    | Rug appears on floor            |
| 15    | Window shows sunset             |
| 20    | Full cozy room with ambient glow|

### 5.6 Momentum Heatmap

- GitHub-contribution-style grid
- Shows last 12 weeks of activity
- Color intensity based on number of completions per day
- Uses the warm amber palette (light → dark amber)
- Displayed on Dashboard

### 5.7 Sound System

| Sound Event    | Sound Type      | Default State |
|----------------|-----------------|---------------|
| Quest complete | Subtle click    | OFF           |
| Level-up       | Warm chime      | OFF           |
| Purchase       | Coin sound      | OFF           |

- Global toggle in Profile/Settings
- Preference persisted to database or cookie
- Respects user's system audio settings

---

## 6. Page-by-Page Specification

### 6.1 Landing Page (`/`)
- **Purpose:** Convert visitors to sign-ups
- **Content:** Hero section with tagline, animated room preview, feature highlights (3-4 cards), social proof placeholder, CTA button to `/signup`
- **SEO:** Full metadata, OG image, H1 with primary keyword

### 6.2 Sign Up (`/signup`)
- **Fields:** Email, Password, Confirm Password
- **Validation:** Zod — email format, password min 8 chars, passwords match
- **On success:** Auto-login, redirect to `/app`
- **Error handling:** Inline field errors, toast for server errors

### 6.3 Log In (`/login`)
- **Fields:** Email, Password
- **Validation:** Zod — required fields
- **On success:** Redirect to `/app`
- **Error handling:** Generic "Invalid credentials" (no email enumeration)

### 6.4 Dashboard (`/app`)
- **Character Card:** Avatar frame, level badge, XP ring (animated), gold counter, title
- **Attribute Tracks:** Three horizontal progress bars (Wisdom, Vitality, Craft)
- **Today's Quests:** Up to 5 most urgent incomplete quests with quick-complete buttons
- **Momentum Heatmap:** 12-week contribution grid
- **Empty state:** "No quests yet — start your adventure!" with CTA

### 6.5 Quests (`/app/quests`)
- **List view:** Cards grouped by type (Quest / Daily / Habit)
- **Filters:** By type, attribute, difficulty, completion status
- **Create button:** Opens modal with full form
- **Quick complete:** Checkbox or button on each card
- **Completion animation:** Card flips/animates, "+X XP" floats up
- **Empty state:** Illustrated scroll with "Create your first Quest"

### 6.6 Market (`/app/market`)
- **Category tabs:** Theme, Badge, Decor, Consumable
- **Item cards:** Image, name, price, "Buy" button (or "Owned" badge)
- **Purchase flow:** Confirm dialog → server validation → success toast
- **Insufficient gold:** Disabled button with tooltip
- **Equip flow:** Toggle button on owned items

### 6.7 Profile (`/app/profile`)
- **Settings:** Timezone selector, sound toggle, theme preference
- **Inventory:** Grid of owned items with equip/unequip
- **Account:** Logout button
- **Stats:** Total quests completed, total XP earned, longest streak

---

## 7. UX Requirements

### 7.1 Loading States
- Skeleton screens matching exact final layout (zero CLS)
- Skeleton uses pulsing animation in parchment/cream tones
- Never show a blank white page

### 7.2 Error States
- Toast notifications for transient errors (network, rate limit)
- Inline retry buttons for failed data loads
- Never a blank screen — always a graceful fallback

### 7.3 Empty States
- Illustrated with themed artwork (scroll, quill, empty bookshelf)
- Single clear CTA to resolve the empty state
- Warm, encouraging copy (not "No data found")

### 7.4 Optimistic Updates
- Quest completion reflects instantly in UI
- XP ring animates immediately with estimated values
- On server error: roll back UI, show error toast
- Gold deductions in Market are optimistic with rollback

### 7.5 Celebrations
- **Level-up:** Full-screen overlay, confetti burst (canvas-confetti, lazy-loaded), new level display, "Skip" button, auto-dismiss after 5 seconds
- **Quest complete:** Card flip animation, floating "+X XP" text, XP ring spring animation
- **Streak milestone (7/30/100):** Toast with fire emoji and multiplier info

### 7.6 Responsive Design
- **Mobile (< 640px):** Single column, bottom navigation, stacked cards
- **Tablet (640–1024px):** Two-column layout, sidebar collapses
- **Desktop (> 1024px):** Full sidebar, multi-column grid, room scene prominent

---

## 8. Accessibility Requirements

| Requirement | Implementation |
|-------------|---------------|
| Keyboard navigation | All interactive elements reachable via Tab. Visible focus rings (2px, warm-amber). |
| Screen readers | `aria-live="polite"` for XP gains, level-ups. All icons have `aria-label`. |
| Reduced motion | `prefers-reduced-motion` → instant transitions, no confetti, no spring animations. |
| Semantic HTML | `<nav>`, `<main>`, `<section>`, `<ul>/<li>` for lists, `<button>` for actions. |
| Color contrast | All text ≥ 4.5:1 ratio against backgrounds. Tested with WebAIM contrast checker. |
| Focus management | Modal open → focus trapped inside. Modal close → focus returns to trigger. |

---

## 9. Success Metrics

### 9.1 Launch Criteria (Definition of Done)
- [ ] New user can: sign up → create quest → complete quest → see XP animate → level up → earn gold → buy item → see room upgrade
- [ ] Works on mobile and desktop
- [ ] Fully keyboard accessible
- [ ] Data persists across logout, refresh, different device
- [ ] Live URL loads without errors in incognito
- [ ] Public repo with 15+ commits, README, .env.example
- [ ] No console errors during normal usage

### 9.2 Quality Targets
- Lighthouse Performance ≥ 90 (mobile)
- Lighthouse Accessibility ≥ 95
- Zero layout shift on page load
- All API responses < 500ms p95
- Zero unhandled runtime errors

---

## 10. Out of Scope (v1)

The following are explicitly **not** included in v1:

- Social features (friends, leaderboards, guilds)
- OAuth providers (Google, GitHub login)
- Push notifications
- Native mobile app
- Real-time multiplayer
- AI-generated quests
- Payment/premium tier
- Admin dashboard
- Data export
- Password reset flow (can be added post-launch)

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Database connection limits on free tier | Medium | High | Connection pooling via Prisma, Neon's serverless driver |
| XP manipulation by savvy users | Low | Medium | All math server-side, rate limits, daily caps |
| Cold start latency on Vercel | Medium | Low | Keep API routes lean, use Edge where possible |
| Scope creep during build | High | Medium | Strict build order, PRD as source of truth |
| Accessibility gaps | Medium | High | Dedicated accessibility pass (Step 9 in build order) |

---

## 12. Appendix

### 12.1 Glossary

| Term | Definition |
|------|-----------|
| Quest | A user-created task with difficulty and attribute assignment |
| XP | Experience points earned by completing quests |
| Gold | In-app currency earned by completing quests, spent in Market |
| Momentum | Streak of consecutive days with at least one quest completed |
| Market | In-app shop where users spend Gold on cosmetic items |
| Attribute | One of three skill trees: Wisdom, Vitality, Craft |
| Character | The user's RPG avatar with level, XP, gold, and title |

### 12.2 User Flow Diagram

```
Landing → Sign Up → Dashboard
                        ↓
              ┌─────────┼─────────┐
              ↓         ↓         ↓
           Quests    Market    Profile
              ↓
        Complete Quest
              ↓
     Server computes XP/Gold
              ↓
     ┌────────┼────────┐
     ↓                 ↓
  Level Up?      Update Streak
     ↓                 ↓
  Celebration    Heatmap Update
```
