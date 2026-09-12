# 🏰 Life RPG — Turn Real-World Tasks into an Epic Cozy Adventure

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind_css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat&logo=postgresql)](https://neon.tech/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Live Deployment:** [https://life-rpg.vercel.app](https://life-rpg.vercel.app) *(Deploy instructions below)*  
> **Video Walkthrough Script:** [docs/walkthrough-script.md](docs/walkthrough-script.md)  
> **Product Requirements (PRD):** [docs/PRD.md](docs/PRD.md)  
> **Technical Requirements (TRD):** [docs/TRD.md](docs/TRD.md)  

---

## 📖 Table of Contents
- [Executive Overview](#-executive-overview)
- [Aesthetic & Theme](#-aesthetic--theme)
- [Core Features](#-core-features)
- [Progression Engine & Game Mechanics](#-progression-engine--game-mechanics)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Security & Anti-Cheat Rules](#-security--anti-cheat-rules)
- [Database Schema](#-database-schema)
- [Getting Started Locally](#-getting-started-locally)
- [API Reference](#-api-reference)
- [Accessibility & Performance](#-accessibility--performance)

---

## 🌟 Executive Overview

**Life RPG** solves the emotional emptiness of traditional to-do lists by gamifying everyday productivity. Users manage **Quests** (tasks), gain **XP** and **Gold**, develop three core attribute skill trees (**Wisdom**, **Vitality**, and **Craft**), maintain **Momentum** streaks on a 12-week GitHub-style heatmap, and watch their personal **Cozy Study Room** visually evolve with unlocked desk items, lighting, and ambient details.

### Non-Negotiable Architectural Principles:
1. **Zero Client-Side Trust:** All XP calculations, streak multipliers, daily caps, and economy transactions are strictly executed server-side.
2. **True Persistence:** Backed by PostgreSQL (Neon Serverless). State persists seamlessly across refreshes, devices, and sessions.
3. **Cozy Lo-fi Aesthetic:** Atmospheric design inspired by lo-fi study livestreams with warm ambers, cream backgrounds, and custom typography.
4. **Resilient UX:** Zero blank screens, complete skeleton loading states, graceful error boundaries, and optimistic mutations with rollback.

---

## 🎨 Aesthetic & Theme

The interface implements a warm, analog study haven palette:

| Token | Hex Value | Application |
|---|---|---|
| `cream` | `#FDF6E3` | Main canvas background |
| `parchment` | `#F5E6D3` | Elevated cards, sidebars, panels |
| `amber-warm` | `#D4A574` | Primary brand accent, buttons, focus rings |
| `brown-deep` | `#5C4033` | High-contrast headings and icons |
| `brown-soft` | `#8B7355` | Secondary text, subtle borders |
| `green-muted` | `#7D9B76` | XP gains, completed checkmarks |
| `gold` | `#C9A84C` | In-game currency, crown badges |
| `ember` | `#B85C38` | Hard difficulty, alerts, delete buttons |

- **Typography:** Fraunces (variable serif for headings) and Inter (for clean UI legibility).
- **Sound Design:** Programmatic Web Audio API synthesizers (zero external MP3 assets needed). Default is OFF with instant toggle in navigation and profile.

---

## ⚔️ Core Features

### 1. Dashboard (`/app`)
- **Character Card:** Real-time level badge, title, gold reserves, and animated SVG circular XP ring with spring physics.
- **Attribute Tracks:** Visual progress monitors for Wisdom (intellectual), Vitality (health & fitness), and Craft (work & creativity).
- **Interactive Cozy Study Room:** A dynamic visual scene where items unlock as your character levels up:
  - *Level 1:* Simple wooden desk and dim lamp
  - *Level 2:* Succulent plant on desk
  - *Level 3:* Reference book on shelf
  - *Level 5:* Warm glowing lamp light animation
  - *Level 7:* Sleeping cat on the windowsill
  - *Level 10:* Full library bookshelf
  - *Level 13:* Hand-woven floor rug
  - *Level 15:* Panoramic sunset through the window
  - *Level 20:* Cozy ambient particle glow
- **Today's Quests:** Top incomplete tasks with instant one-click completion.
- **Momentum Heatmap:** 12-week GitHub-style activity grid visualizing daily quest completion density.

### 2. Quest Management (`/app/quests`)
- Full CRUD capabilities: Create, Read, Update, Complete, and Delete quests.
- Grouping & Filtering by quest type:
  - **Quests:** One-time tasks
  - **Dailies:** Recurring day-to-day commitments
  - **Habits:** Long-term routine tracking
- Filterable by difficulty (`EASY`, `MEDIUM`, `HARD`) and attribute (`WISDOM`, `VITALITY`, `CRAFT`).
- **Optimistic UI:** Checkbox immediately triggers visual completion, card animation, and floating `+X XP` text. Reverts cleanly if the backend reports an error.
- **Celebration Modal:** Leveling up triggers a full-screen celebration modal with warm-toned confetti bursts (`canvas-confetti`).

### 3. Market & Inventory (`/app/market`)
- Shop for cosmetic room themes (*Midnight Study*, *Sakura Garden*, *Forest Cabin*), adventurer badges (*Early Bird*, *Bookworm*), and desk decor.
- Atomic purchase transactions: verifies gold balance server-side and deducts funds without negative balance exploits.
- Equip/unequip cosmetics directly from the Market or Profile page.

### 4. Adventurer Profile (`/app/profile`)
- Lifetime player statistics (Total quests completed, Total XP gained, Longest streak).
- Inventory showcase with one-click equip management.
- Audio preferences toggle and timezone configuration for midnight streak resets.

---

## 📐 Progression Engine & Game Mechanics

### 1. XP Curve Formula
The XP required to progress from level $n$ to $n+1$ follows:
$$\text{XP}(n) = \lfloor 100 \times n^{1.5} \rfloor$$

| Level | XP to Next | Total Accumulated XP |
|---|---|---|
| Level 1 | 100 XP | 0 XP |
| Level 2 | 282 XP | 100 XP |
| Level 3 | 519 XP | 382 XP |
| Level 5 | 1,118 XP | 1,732 XP |
| Level 10 | 3,162 XP | 11,460 XP |

### 2. Quest Rewards
Rewards are strictly scaled by quest difficulty:

| Difficulty | Base XP Reward | Base Gold Reward |
|---|---|---|
| **EASY** | 10 XP | 5 Gold |
| **MEDIUM** | 25 XP | 12 Gold |
| **HARD** | 50 XP | 25 Gold |

### 3. Momentum Streaks (Multipliers)
Maintaining consecutive days of activity boosts XP gains:
- **7-Day Streak:** 1.10× XP bonus
- **30-Day Streak:** 1.25× XP bonus
- **100-Day Streak:** 1.50× XP bonus

---

## 🛡️ Security & Anti-Cheat Rules

To protect progression integrity:
1. **Client Never Dictates Rewards:** The client only sends `{ taskId }`. The server reads the task difficulty, creation timestamp, and streak from PostgreSQL to compute the payout.
2. **Daily XP Cap:** A maximum ceiling of 500 XP per user per calendar day.
3. **Anti-Backfill Decay:** Tasks created more than 3 days prior yield a 50% XP penalty to discourage retroactively logging backlogs.
4. **Rate Limiting:** Completion requests are capped at 30 requests per minute per authenticated user.
5. **Atomic Isolation:** Task state transition, completion logging, XP incrementing, gold payout, and streak calculations occur inside a single `prisma.$transaction`.

---

## 🗄️ Database Schema

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id             String          @id @default(cuid())
  email          String          @unique
  passwordHash   String
  timezone       String          @default("UTC")
  createdAt      DateTime        @default(now())
  character      Character?
  attributes     Attribute[]
  tasks          Task[]
  completions    Completion[]
  streaks        Streak[]
  inventoryItems InventoryItem[]
  transactions   Transaction[]
}

model Character {
  id            String  @id @default(cuid())
  userId        String  @unique
  level         Int     @default(1)
  xp            Int     @default(0)
  totalXp       Int     @default(0)
  gold          Int     @default(0)
  title         String  @default("Novice Adventurer")
  equippedTheme String?
  user          User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Attribute {
  id     String        @id @default(cuid())
  userId String
  name   AttributeName // WISDOM, VITALITY, CRAFT
  level  Int           @default(1)
  xp     Int           @default(0)
  user   User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, name])
}

model Task {
  id            String        @id @default(cuid())
  userId        String
  title         String
  description   String?
  difficulty    Difficulty    @default(MEDIUM)
  attributeName AttributeName
  type          TaskType      @default(QUEST)
  dueAt         DateTime?
  completedAt   DateTime?
  createdAt     DateTime      @default(now())
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  completions   Completion[]
  @@index([userId, completedAt])
}
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL database (or free [Neon Serverless](https://neon.tech) account)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/life-rpg.git
cd life-rpg
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database URL and Auth secret:
```env
DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"
AUTH_SECRET="your-generated-32-char-random-secret"
AUTH_URL="http://localhost:3000"
```

### 3. Initialize Database & Seed Market Items
```bash
# Push schema to database
npm run db:push

# Seed catalog items (Themes, Badges, Decor, Consumables)
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference

| Method | Route | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Create user account + initialize character & attributes | No |
| `GET` | `/api/character` | Fetch character level, gold, XP, and progress % | Yes |
| `GET` | `/api/attributes` | Fetch 3 attribute track levels and progression | Yes |
| `GET` | `/api/tasks` | Fetch quests (filter by type, attribute, status) | Yes |
| `POST` | `/api/tasks` | Inscribe a new quest | Yes |
| `PATCH` | `/api/tasks/:id` | Update quest title, difficulty, due date | Yes |
| `DELETE`| `/api/tasks/:id` | Delete quest | Yes |
| `POST` | `/api/tasks/:id/complete` | Complete quest & receive server-computed payout | Yes |
| `GET` | `/api/streaks` | Fetch momentum streaks & 12-week heatmap data | Yes |
| `GET` | `/api/market/items` | List market items with ownership annotated | Yes |
| `POST` | `/api/market/purchase` | Purchase market item with gold balance check | Yes |
| `POST` | `/api/market/equip` | Toggle cosmetic item equipped state | Yes |
| `GET` | `/api/profile` | Lifetime stats, account details, and inventory | Yes |
| `PATCH` | `/api/profile` | Update user settings (e.g. timezone) | Yes |

---

## ♿ Accessibility & Performance

- **WCAG 2.1 AA:** Minimum 4.5:1 text-to-background contrast ratio maintained throughout parchment and cream surfaces.
- **Keyboard Navigable:** Visible 2px `amber-warm` outline focus rings across all links, buttons, and form inputs.
- **Screen Reader Announcements:** Dedicated `aria-live="polite"` DOM region dynamically announces quest completion XP, gold gains, and level elevations.
- **Prefers-Reduced-Motion:** Respects OS-level motion reduction flags by disabling confetti particle bursts and spring animations.
- **SEO & Social Share:** Dynamic `robots.txt`, XML sitemap (`/sitemap.xml`), OpenGraph metadata, and semantic HTML structure (`<nav>`, `<main>`, `<article>`).
