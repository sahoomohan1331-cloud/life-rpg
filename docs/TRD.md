# Life RPG — Technical Requirements Document (TRD)

> **Version:** 1.0  
> **Date:** 2026-09-12  
> **Status:** Draft — Pending Approval  
> **Companion:** [PRD.md](file:///d:/Life%20RPG/docs/PRD.md)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Next.js 14+ (App Router)               │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │   │
│  │  │   Server     │  │   Client     │  │  Middleware    │   │   │
│  │  │  Components  │  │  Components  │  │  (Auth Guard)  │   │   │
│  │  └──────┬──────┘  └──────┬───────┘  └───────────────┘   │   │
│  │         │                │                               │   │
│  │  ┌──────▼──────────────────▼──────┐                      │   │
│  │  │        API Route Handlers       │                      │   │
│  │  │   /api/auth/* | /api/tasks/*   │                      │   │
│  │  │   /api/character | /api/market │                      │   │
│  │  └──────────────┬─────────────────┘                      │   │
│  │                 │                                         │   │
│  │  ┌──────────────▼─────────────────┐                      │   │
│  │  │     Progression Engine          │                      │   │
│  │  │  (XP, Leveling, Streaks, Caps) │                      │   │
│  │  └──────────────┬─────────────────┘                      │   │
│  │                 │                                         │   │
│  │  ┌──────────────▼─────────────────┐                      │   │
│  │  │     Prisma ORM Client          │                      │   │
│  │  └──────────────┬─────────────────┘                      │   │
│  └─────────────────┼────────────────────────────────────────┘   │
└────────────────────┼────────────────────────────────────────────┘
                     │ TCP/TLS (Connection Pooling)
              ┌──────▼──────┐
              │  Neon        │
              │  PostgreSQL  │
              │  (Serverless)│
              └─────────────┘
```

---

## 2. Technology Stack — Exact Versions & Rationale

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js (App Router) | 14.x+ | Server Components, API routes, middleware, metadata API |
| Language | TypeScript | 5.x | Type safety across client/server boundary |
| Styling | Tailwind CSS | 3.x | Utility-first, custom theme tokens, responsive |
| Components | shadcn/ui | Latest | Headless, accessible primitives — **heavily restyled** |
| Animation | Framer Motion | 11.x | Spring physics, layout animations, gesture support |
| Confetti | canvas-confetti | 1.x | Level-up celebrations, **lazy-loaded** |
| Database | PostgreSQL | 16 | ACID transactions, JSON support, mature ecosystem |
| DB Hosting | Neon | Serverless | Auto-scaling, branching, connection pooling |
| ORM | Prisma | 5.x | Type-safe queries, migrations, transactions |
| Auth | Auth.js (NextAuth) | 5.x (v5) | Credentials provider, httpOnly cookies, middleware integration |
| Password Hash | bcrypt | 5.x | Industry-standard, configurable salt rounds (12) |
| Validation | Zod | 3.x | Shared schemas client ↔ server, TypeScript inference |
| Client State | TanStack Query | 5.x | Cache, optimistic updates, background refetching |
| Deployment | Vercel | — | Edge network, serverless functions, Next.js native |

---

## 3. Project Structure

```
life-rpg/
├── .env.example
├── .gitignore
├── README.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                    # Market items seed data
├── docs/
│   ├── PRD.md
│   ├── TRD.md
│   └── walkthrough-script.md
├── public/
│   ├── sounds/
│   │   ├── complete.mp3
│   │   └── levelup.mp3
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (fonts, providers)
│   │   ├── page.tsx               # Landing page (Server Component)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── app/
│   │   │   ├── layout.tsx         # Authenticated layout (sidebar, nav)
│   │   │   ├── page.tsx           # Dashboard
│   │   │   ├── quests/
│   │   │   │   └── page.tsx
│   │   │   ├── market/
│   │   │   │   └── page.tsx
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       ├── tasks/
│   │       │   ├── route.ts       # GET (list), POST (create)
│   │       │   ├── [id]/
│   │       │   │   ├── route.ts   # PATCH (update), DELETE
│   │       │   │   └── complete/
│   │       │   │       └── route.ts  # POST (complete task)
│   │       ├── character/
│   │       │   └── route.ts       # GET
│   │       ├── attributes/
│   │       │   └── route.ts       # GET
│   │       ├── market/
│   │       │   ├── items/
│   │       │   │   └── route.ts   # GET
│   │       │   └── purchase/
│   │       │       └── route.ts   # POST
│   │       └── streaks/
│   │           └── route.ts       # GET
│   ├── lib/
│   │   ├── prisma.ts              # Singleton Prisma client
│   │   ├── auth.ts                # Auth.js config
│   │   ├── auth-options.ts        # NextAuth options
│   │   ├── progression.ts         # XP/level/streak engine
│   │   ├── rate-limiter.ts        # Per-user rate limiting
│   │   └── utils.ts               # General utilities
│   ├── schemas/
│   │   ├── task.ts                # Zod schemas for task CRUD
│   │   ├── auth.ts                # Zod schemas for auth forms
│   │   └── market.ts              # Zod schemas for purchases
│   ├── components/
│   │   ├── ui/                    # Restyled shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── signup-form.tsx
│   │   ├── dashboard/
│   │   │   ├── character-card.tsx
│   │   │   ├── attribute-tracks.tsx
│   │   │   ├── today-quests.tsx
│   │   │   └── momentum-heatmap.tsx
│   │   ├── quests/
│   │   │   ├── quest-list.tsx
│   │   │   ├── quest-card.tsx
│   │   │   ├── quest-form.tsx
│   │   │   └── quest-filters.tsx
│   │   ├── market/
│   │   │   ├── item-grid.tsx
│   │   │   ├── item-card.tsx
│   │   │   └── purchase-dialog.tsx
│   │   ├── room/
│   │   │   └── study-room.tsx     # SVG/CSS visual scene
│   │   ├── shared/
│   │   │   ├── xp-ring.tsx
│   │   │   ├── floating-xp.tsx
│   │   │   ├── level-up-modal.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   ├── nav-sidebar.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── sound-manager.tsx
│   │   └── providers/
│   │       ├── query-provider.tsx
│   │       ├── session-provider.tsx
│   │       └── sound-provider.tsx
│   ├── hooks/
│   │   ├── use-tasks.ts           # TanStack Query hooks for tasks
│   │   ├── use-character.ts
│   │   ├── use-market.ts
│   │   ├── use-streaks.ts
│   │   ├── use-sound.ts
│   │   └── use-complete-task.ts   # Optimistic mutation
│   ├── types/
│   │   └── index.ts               # Shared TypeScript types
│   └── middleware.ts              # Auth guard for /app/* routes
```

---

## 4. Database Schema (Prisma)

### 4.1 Complete Schema Definition

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")   // For migrations (Neon pooling)
}

// ─── ENUMS ─────────────────────────────────────────

enum AttributeName {
  WISDOM
  VITALITY
  CRAFT
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum TaskType {
  QUEST
  DAILY
  HABIT
}

enum ItemCategory {
  THEME
  BADGE
  DECOR
  CONSUMABLE
}

// ─── MODELS ────────────────────────────────────────

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  timezone     String   @default("UTC")
  createdAt    DateTime @default(now())

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

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Attribute {
  id     String        @id @default(cuid())
  userId String
  name   AttributeName
  level  Int           @default(1)
  xp     Int           @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

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

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  completions Completion[]

  @@index([userId, completedAt])
}

model Completion {
  id          String   @id @default(cuid())
  taskId      String
  userId      String
  xpAwarded   Int
  goldAwarded Int
  completedAt DateTime @default(now())

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, completedAt])
}

model Streak {
  id                String   @id @default(cuid())
  userId            String
  taskId            String?  // null = global streak
  current           Int      @default(0)
  longest           Int      @default(0)
  lastCompletedDate DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Item {
  id         String       @id @default(cuid())
  name       String
  category   ItemCategory
  price      Int
  assetUrl   String?
  effectJson Json?

  inventoryItems InventoryItem[]
  transactions   Transaction[]
}

model InventoryItem {
  id         String   @id @default(cuid())
  userId     String
  itemId     String
  acquiredAt DateTime @default(now())
  equipped   Boolean  @default(false)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  item Item @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@unique([userId, itemId])
}

model Transaction {
  id        String   @id @default(cuid())
  userId    String
  itemId    String
  price     Int
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  item Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
}
```

### 4.2 Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| Character : "has one"
    User ||--o{ Attribute : "has many"
    User ||--o{ Task : "owns"
    User ||--o{ Completion : "earns"
    User ||--o{ Streak : "tracks"
    User ||--o{ InventoryItem : "owns"
    User ||--o{ Transaction : "makes"
    Task ||--o{ Completion : "generates"
    Item ||--o{ InventoryItem : "in inventory"
    Item ||--o{ Transaction : "purchased via"

    User {
        string id PK
        string email UK
        string passwordHash
        string timezone
        datetime createdAt
    }

    Character {
        string id PK
        string userId FK_UK
        int level
        int xp
        int totalXp
        int gold
        string title
        string equippedTheme
    }

    Attribute {
        string id PK
        string userId FK
        enum name
        int level
        int xp
    }

    Task {
        string id PK
        string userId FK
        string title
        string description
        enum difficulty
        enum attributeName
        enum type
        datetime dueAt
        datetime completedAt
        datetime createdAt
    }

    Completion {
        string id PK
        string taskId FK
        string userId FK
        int xpAwarded
        int goldAwarded
        datetime completedAt
    }

    Streak {
        string id PK
        string userId FK
        string taskId FK
        int current
        int longest
        datetime lastCompletedDate
    }

    Item {
        string id PK
        string name
        enum category
        int price
        string assetUrl
        json effectJson
    }

    InventoryItem {
        string id PK
        string userId FK
        string itemId FK
        datetime acquiredAt
        boolean equipped
    }

    Transaction {
        string id PK
        string userId FK
        string itemId FK
        int price
        datetime createdAt
    }
```

---

## 5. API Specification

### 5.1 Authentication Routes

| Method | Endpoint | Auth | Request Body | Response | Status Codes |
|--------|----------|------|-------------|----------|-------------|
| POST | `/api/auth/[...nextauth]` | — | Handled by Auth.js | Session | 200, 401 |
| POST | `/api/auth/signup` | — | `{ email, password }` | `{ user }` | 201, 400, 409 |

### 5.2 Task Routes

| Method | Endpoint | Auth | Request Body | Response | Status Codes |
|--------|----------|------|-------------|----------|-------------|
| GET | `/api/tasks` | ✅ | — (query params: type, attribute, completed) | `Task[]` | 200, 401 |
| POST | `/api/tasks` | ✅ | `{ title, description?, difficulty, attributeName, type, dueAt? }` | `Task` | 201, 400, 401 |
| PATCH | `/api/tasks/:id` | ✅ | Partial `Task` fields | `Task` | 200, 400, 401, 404 |
| DELETE | `/api/tasks/:id` | ✅ | — | `{ success: true }` | 200, 401, 404 |
| POST | `/api/tasks/:id/complete` | ✅ | — (only taskId in URL) | `{ xpAwarded, goldAwarded, leveledUp, newLevel, streakUpdate }` | 200, 400, 401, 404, 429 |

### 5.3 Character & Attribute Routes

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/api/character` | ✅ | `Character` with computed `xpToNextLevel` |
| GET | `/api/attributes` | ✅ | `Attribute[]` with computed `xpToNextLevel` per attribute |

### 5.4 Market Routes

| Method | Endpoint | Auth | Request Body | Response | Status Codes |
|--------|----------|------|-------------|----------|-------------|
| GET | `/api/market/items` | ✅ | — (query: category) | `Item[]` with `owned` boolean | 200, 401 |
| POST | `/api/market/purchase` | ✅ | `{ itemId }` | `{ inventoryItem, newGoldBalance }` | 200, 400, 401, 409 (already owned), 402 (insufficient gold) |

### 5.5 Streak Routes

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/api/streaks` | ✅ | `{ globalStreak, completionsByDay: Record<string, number> }` |

### 5.6 Common Response Envelope

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string, details?: unknown } }
```

### 5.7 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Zod validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid session |
| `NOT_FOUND` | 404 | Resource doesn't exist or belongs to another user |
| `CONFLICT` | 409 | Duplicate (email exists, item already owned) |
| `RATE_LIMITED` | 429 | Too many completions per minute |
| `DAILY_CAP` | 400 | 500 XP daily cap reached |
| `INSUFFICIENT_GOLD` | 402 | Not enough gold for purchase |
| `ALREADY_COMPLETED` | 400 | Task already completed (for QUEST type) |
| `SERVER_ERROR` | 500 | Unexpected error |

---

## 6. Progression Engine — Technical Specification

### 6.1 Core Functions

```typescript
// src/lib/progression.ts

/** XP required to reach level n (from level n-1) */
export function xpForLevel(n: number): number {
  return Math.floor(100 * Math.pow(n, 1.5));
}

/** Total XP accumulated from level 1 to level n */
export function totalXpForLevel(n: number): number {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += xpForLevel(i);
  }
  return total;
}

/** Difficulty → reward mapping */
export const DIFFICULTY_REWARDS = {
  EASY:   { xp: 10, gold: 5  },
  MEDIUM: { xp: 25, gold: 12 },
  HARD:   { xp: 50, gold: 25 },
} as const;

/** Streak multiplier thresholds */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 100) return 1.5;
  if (streak >= 30)  return 1.25;
  if (streak >= 7)   return 1.1;
  return 1.0;
}

/** Anti-backfill: 50% XP if task > 3 days old */
export function getBackfillMultiplier(taskCreatedAt: Date, now: Date): number {
  const daysDiff = (now.getTime() - taskCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff > 3 ? 0.5 : 1.0;
}

/** Daily XP cap */
export const DAILY_XP_CAP = 500;

/** Rate limit: completions per minute */
export const COMPLETIONS_PER_MINUTE = 30;

/** Character titles by level */
export const TITLES: Record<number, string> = {
  1:  "Novice Adventurer",
  5:  "Apprentice Scholar",
  10: "Seasoned Explorer",
  15: "Adept Practitioner",
  20: "Master of the Realm",
  25: "Grand Sage",
  30: "Legendary Hero",
};
```

### 6.2 Task Completion Transaction

The complete task endpoint performs ALL of the following in a **single Prisma `$transaction`**:

```
1. Fetch task (verify ownership, not already completed for QUEST type)
2. Fetch user's streak record
3. Fetch today's total XP (for daily cap check)
4. Check rate limit (completions in last minute)
5. Calculate base XP/gold from difficulty
6. Apply streak multiplier to XP
7. Apply backfill multiplier if applicable
8. Enforce daily cap (reduce XP if would exceed 500)
9. Mark task as completed (set completedAt)
10. Create Completion record
11. Update Character XP, totalXp, gold
12. Check for level-up (loop: while xp >= xpForLevel(level+1))
13. Update Character level and title if leveled up
14. Update Attribute XP and level
15. Update Streak (current, longest, lastCompletedDate)
16. Return result: { xpAwarded, goldAwarded, leveledUp, newLevel, streakUpdate }
```

### 6.3 Race Condition Prevention

- All reward logic in `prisma.$transaction()` with default isolation
- Optimistic locking not needed — single-user-writes model
- Rate limiter uses in-memory Map (acceptable for single Vercel instance; for multi-instance, upgrade to Redis)

---

## 7. Authentication Architecture

### 7.1 Auth Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Middleware
    participant A as Auth.js
    participant DB as PostgreSQL

    Note over C: Sign Up Flow
    C->>A: POST /api/auth/signup {email, password}
    A->>A: Zod validate
    A->>A: bcrypt.hash(password, 12)
    A->>DB: Create User + Character + 3 Attributes
    A->>C: 201 Created

    Note over C: Login Flow
    C->>A: POST /api/auth/[...nextauth] (credentials)
    A->>DB: Find user by email
    A->>A: bcrypt.compare(password, hash)
    A->>C: Set httpOnly session cookie

    Note over C: Authenticated Request
    C->>M: GET /app/quests (with cookie)
    M->>A: Verify session
    A->>M: Session valid + userId
    M->>C: Allow through
```

### 7.2 Middleware Configuration

```typescript
// src/middleware.ts
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/app/:path*", "/api/tasks/:path*", "/api/character/:path*", 
            "/api/attributes/:path*", "/api/market/:path*", "/api/streaks/:path*"],
};
```

### 7.3 Password Requirements
- Minimum 8 characters
- Hashed with bcrypt, 12 salt rounds
- Never stored in plaintext, never logged
- Never returned in API responses

---

## 8. Client-Side Architecture

### 8.1 Data Flow

```mermaid
graph TD
    A[Server Components] -->|Initial Data| B[Client Components]
    B -->|Mutations| C[TanStack Query]
    C -->|Optimistic Update| D[UI State]
    C -->|API Call| E[API Routes]
    E -->|Server Response| C
    C -->|Reconcile/Rollback| D
    D -->|Render| B
```

### 8.2 TanStack Query Keys

```typescript
export const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    list: (filters: TaskFilters) => ['tasks', 'list', filters] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
  },
  character: {
    current: ['character'] as const,
  },
  attributes: {
    all: ['attributes'] as const,
  },
  market: {
    items: (category?: ItemCategory) => ['market', 'items', category] as const,
  },
  streaks: {
    current: ['streaks'] as const,
  },
} as const;
```

### 8.3 Optimistic Update Pattern (Task Completion)

```typescript
// Pseudocode for the useMutation hook
const completeTask = useMutation({
  mutationFn: (taskId: string) => fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' }),
  
  onMutate: async (taskId) => {
    // 1. Cancel in-flight queries
    await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });
    
    // 2. Snapshot previous state
    const previousTasks = queryClient.getQueryData(queryKeys.tasks.all);
    const previousCharacter = queryClient.getQueryData(queryKeys.character.current);
    
    // 3. Optimistically update
    queryClient.setQueryData(queryKeys.tasks.all, (old) => 
      old.map(t => t.id === taskId ? { ...t, completedAt: new Date() } : t)
    );
    
    // 4. Show floating "+X XP" animation
    triggerXPAnimation(estimatedXP);
    
    return { previousTasks, previousCharacter };
  },
  
  onError: (err, taskId, context) => {
    // 5. Rollback on failure
    queryClient.setQueryData(queryKeys.tasks.all, context.previousTasks);
    queryClient.setQueryData(queryKeys.character.current, context.previousCharacter);
    toast.error("Failed to complete quest. Please try again.");
  },
  
  onSettled: () => {
    // 6. Refetch to reconcile
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.character.current });
    queryClient.invalidateQueries({ queryKey: queryKeys.attributes.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.streaks.current });
  },
});
```

---

## 9. Validation Schemas (Zod)

### 9.1 Shared Schemas

```typescript
// src/schemas/task.ts
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  attributeName: z.enum(["WISDOM", "VITALITY", "CRAFT"]),
  type: z.enum(["QUEST", "DAILY", "HABIT"]),
  dueAt: z.string().datetime().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// src/schemas/auth.ts
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// src/schemas/market.ts
export const purchaseSchema = z.object({
  itemId: z.string().cuid(),
});
```

---

## 10. Rate Limiting Implementation

### 10.1 In-Memory Rate Limiter

```typescript
// src/lib/rate-limiter.ts

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  userId: string,
  maxRequests: number = 30,
  windowMs: number = 60_000
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = store.get(userId) || { timestamps: [] };
  
  // Prune expired timestamps
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);
  
  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0];
    return { allowed: false, retryAfterMs: windowMs - (now - oldest) };
  }
  
  entry.timestamps.push(now);
  store.set(userId, entry);
  return { allowed: true };
}
```

> **Note:** This in-memory approach works for single-instance Vercel deployments. For multi-instance, replace with Upstash Redis.

---

## 11. Styling Architecture

### 11.1 Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream:       '#FDF6E3',
        parchment:   '#F5E6D3',
        amber: {
          warm:      '#D4A574',
          light:     '#E8C9A0',
          dark:      '#B8956A',
        },
        brown: {
          soft:      '#8B7355',
          dark:      '#5C4033',
          deep:      '#3D2B1F',
        },
        green: {
          muted:     '#7D9B76',
          light:     '#A8C5A0',
          dark:      '#5A7D52',
        },
        gold:        '#C9A84C',
        ember:       '#B85C38',
      },
      fontFamily: {
        heading: ['Fraunces', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'cozy': '12px',
      },
      boxShadow: {
        'cozy':    '0 2px 8px rgba(92, 64, 51, 0.08)',
        'cozy-lg': '0 4px 16px rgba(92, 64, 51, 0.12)',
        'warm':    '0 0 20px rgba(212, 165, 116, 0.15)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### 11.2 shadcn/ui Restyling Strategy

Every shadcn/ui component will be restyled to match the cozy theme:
- **Buttons:** Rounded-cozy, warm-amber background, brown text, soft shadow
- **Cards:** Parchment background, soft-brown border, cozy shadow
- **Inputs:** Cream background, brown border, amber focus ring
- **Dialogs:** Parchment overlay, cozy border radius, slide-in animation
- **Toasts:** Warm color scheme, positioned bottom-right

---

## 12. Performance Strategy

### 12.1 Server vs. Client Components

| Component | Type | Reason |
|-----------|------|--------|
| Landing page | Server | Static content, SEO |
| Dashboard layout | Server | Initial data fetch |
| Character card | Client | Animated XP ring |
| Quest list | Client | Optimistic updates, filters |
| Quest form modal | Client | Form state, validation |
| Market grid | Client | Purchase mutations |
| Study room | Client | Framer Motion animations |
| Heatmap | Client | Interactive tooltips |
| Nav sidebar | Server | Static layout |

### 12.2 Lazy Loading Strategy

```typescript
// Heavy modules loaded only when needed
const confetti = dynamic(() => import('canvas-confetti'), { ssr: false });
const LevelUpModal = dynamic(() => import('@/components/shared/level-up-modal'), { ssr: false });
const StudyRoom = dynamic(() => import('@/components/room/study-room'), { 
  ssr: false,
  loading: () => <StudyRoomSkeleton />
});
```

### 12.3 Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.5s | Server Components, optimized images |
| FID | < 100ms | Minimal client JS, code splitting |
| CLS | < 0.1 | Skeleton screens, font-display: swap |
| Lighthouse Score | ≥ 90 | All of the above + proper caching |

---

## 13. Security Considerations

### 13.1 Authentication Security
- Passwords hashed with bcrypt (12 rounds)
- httpOnly session cookies (no XSS access)
- Session validated on every API request
- No email enumeration (generic error messages)

### 13.2 API Security
- All `/api/*` routes (except auth) require valid session
- Zod validation on all inputs
- SQL injection prevented by Prisma parameterized queries
- CSRF protection via Auth.js built-in mechanisms

### 13.3 Anti-Cheat (Server-Side)
- Client never transmits XP/gold values
- All reward math in server-side Prisma transactions
- Rate limiting (30 completions/minute)
- Daily XP cap (500 XP/day)
- Anti-backfill (50% XP for tasks > 3 days old)
- Task ownership verified before completion

### 13.4 Data Privacy
- Passwords never logged or returned in API responses
- User can only access their own data (ownership checks on every query)
- No third-party analytics in v1

---

## 14. Deployment Architecture

### 14.1 Infrastructure

```
┌────────────────────────┐     ┌────────────────────┐
│       Vercel            │     │      Neon           │
│                         │     │                     │
│  ┌──────────────────┐   │     │  ┌───────────────┐  │
│  │ Next.js App      │   │────▶│  │ PostgreSQL    │  │
│  │ (Edge + Node.js) │   │     │  │ (Serverless)  │  │
│  └──────────────────┘   │     │  └───────────────┘  │
│                         │     │                     │
│  CDN (Static Assets)    │     │  Connection Pooling │
│  Serverless Functions   │     │  Auto-suspend       │
└────────────────────────┘     └────────────────────┘
```

### 14.2 Environment Variables

```bash
# .env.example

# Database (Neon)
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/dbname?sslmode=require"

# Auth.js
NEXTAUTH_SECRET="generate-a-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"  # Update for production

# Optional
NODE_ENV="development"
```

### 14.3 Deployment Checklist

- [ ] Neon database created and connection string obtained
- [ ] Prisma migrations applied to production DB
- [ ] Seed data (market items) applied
- [ ] Environment variables set in Vercel dashboard
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] Build succeeds with `next build`
- [ ] All API routes responding correctly
- [ ] Auth flow working end-to-end
- [ ] No console errors in production

---

## 15. Build Order & Commit Plan

### 15.1 Build Phases (matches PRD Section 11)

| Phase | Description | Estimated Commits |
|-------|-------------|-------------------|
| 1 | Scaffold + DB schema + migrations | 2 |
| 2 | Auth (signup, login, middleware) | 2 |
| 3 | Task CRUD API + UI | 2 |
| 4 | Progression engine (XP, levels, attributes) | 2 |
| 5 | Streaks + heatmap | 1 |
| 6 | Market (items, purchase, inventory) | 2 |
| 7 | Study room visual scene | 1 |
| 8 | Micro-interactions + celebrations + sound | 1 |
| 9 | Accessibility pass | 1 |
| 10 | SEO + performance + error states | 1 |
| 11 | README + docs + deploy | 1 |
| 12 | Final QA + fixes | 1+ |
| **Total** | | **17+** |

### 15.2 Commit Message Format

```
feat(scope): description

Examples:
feat(db): add Prisma schema with all models and migrations
feat(auth): implement signup, login, and session middleware
feat(tasks): add CRUD API routes with Zod validation
feat(tasks): build quest list UI with optimistic completion
feat(xp): implement server-side progression engine
feat(streaks): add momentum tracking and heatmap component
feat(market): add item catalog, purchase flow, and inventory
feat(room): build cozy study room with level-based upgrades
feat(ux): add level-up celebration, confetti, and sound toggle
fix(a11y): keyboard navigation, focus rings, aria-live regions
perf(seo): add metadata, sitemap, robots.txt, image optimization
docs: add README, .env.example, and walkthrough script
chore: deploy to Vercel, connect Neon, final QA
```

---

## 16. Testing Strategy

### 16.1 Manual Testing Matrix

| Area | Test Cases |
|------|-----------|
| Auth | Sign up, login, logout, protected route redirect, invalid credentials |
| Tasks | Create, edit, delete, complete, filter, empty state |
| Progression | XP award, level-up, attribute XP, streak multiplier, daily cap, rate limit |
| Market | Browse, purchase, insufficient gold, equip, already owned |
| UI | Mobile layout, desktop layout, skeleton loading, error toast, celebration modal |
| Accessibility | Tab navigation, focus rings, screen reader, reduced motion |
| Edge cases | Rapid completions, expired session, network error, empty data |

### 16.2 QA Environments

| Environment | Purpose |
|-------------|---------|
| `localhost:3000` | Development |
| Vercel Preview | PR validation |
| Vercel Production | Live deployment |
| Incognito (Chrome + Firefox) | Final QA |
| Mobile (Chrome DevTools) | Responsive QA |

---

## 17. Appendix

### 17.1 Market Seed Items

```typescript
const SEED_ITEMS = [
  // Themes
  { name: "Midnight Study",    category: "THEME",      price: 100, effectJson: { theme: "midnight" } },
  { name: "Sakura Garden",     category: "THEME",      price: 150, effectJson: { theme: "sakura" } },
  { name: "Forest Cabin",      category: "THEME",      price: 200, effectJson: { theme: "forest" } },
  
  // Badges
  { name: "Early Bird",        category: "BADGE",      price: 50,  effectJson: { badge: "early-bird" } },
  { name: "Night Owl",         category: "BADGE",      price: 50,  effectJson: { badge: "night-owl" } },
  { name: "Streak Master",     category: "BADGE",      price: 75,  effectJson: { badge: "streak-master" } },
  
  // Decor
  { name: "Potted Succulent",  category: "DECOR",      price: 30,  effectJson: { decor: "succulent" } },
  { name: "Vintage Globe",     category: "DECOR",      price: 60,  effectJson: { decor: "globe" } },
  { name: "Fairy Lights",      category: "DECOR",      price: 45,  effectJson: { decor: "fairy-lights" } },
  { name: "Vinyl Player",      category: "DECOR",      price: 80,  effectJson: { decor: "vinyl" } },
  
  // Consumables
  { name: "XP Scroll (2x)",    category: "CONSUMABLE", price: 100, effectJson: { xpMultiplier: 2, duration: "1h" } },
  { name: "Gold Charm (2x)",   category: "CONSUMABLE", price: 100, effectJson: { goldMultiplier: 2, duration: "1h" } },
];
```

### 17.2 Room Scene Elements by Level

| Level | Element | CSS/SVG ID | Description |
|-------|---------|-----------|-------------|
| 1 | Desk | `#room-desk` | Simple wooden desk |
| 1 | Lamp (off) | `#room-lamp` | Desk lamp, unlit |
| 2 | Plant (small) | `#room-plant` | Tiny sprout in pot |
| 3 | Book (1) | `#room-book-1` | Single book on shelf |
| 5 | Lamp (on) | `#room-lamp-glow` | Warm glow effect |
| 7 | Cat | `#room-cat` | Cat on windowsill |
| 10 | Books (full) | `#room-bookshelf` | Full bookshelf |
| 13 | Rug | `#room-rug` | Patterned rug |
| 15 | Window (sunset) | `#room-window` | Sunset gradient |
| 20 | Ambient glow | `#room-ambient` | Full warm ambient |
