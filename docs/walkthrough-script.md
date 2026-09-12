# Life RPG — Walkthrough Video Script

> **Video Duration:** ~3:30  
> **Audience:** Users, evaluators, developers, productivity enthusiasts  
> **Audio Style:** Relaxed, upbeat lo-fi background beats, clear and engaging narration  
> **Visual Tone:** Warm cozy ambers, parchment textures, smooth micro-interactions  

---

## Scene Breakdown

### Scene 1: The Hook & Introduction (0:00 – 0:30)
- **Visual:** Smooth cinematic zoom on the landing page (`/`). Showcases the hero banner, tagline: *"Turn your daily chores into an epic cozy quest"*, and the preview of the lo-fi study room with glowing lamp and sleeping cat.
- **Narrator (Audio):**  
  > *"Have you ever checked off ten tasks on a to-do list and felt... completely nothing? Traditional productivity apps treat your life like a bland spreadsheet. Welcome to **Life RPG** — a full-stack gamified web application that transforms your real-world tasks into an RPG progression system wrapped in a warm, cozy lo-fi study room."*
- **On-Screen Action:** Scroll through features (Quest Engine, Momentum Streaks, Cozy Room, Market Shop) and click **"Begin Your Journey"** to navigate to `/signup`.

---

### Scene 2: Adventurer Registration (0:30 – 0:50)
- **Visual:** The sign-up interface (`/signup`) with parchment card styling and friendly input focus states.
- **Narrator (Audio):**  
  > *"Starting your adventure takes seconds. Behind the scenes, Life RPG provisions a persistent character profile, initializes your three primary attribute trees — Wisdom, Vitality, and Craft — and connects you to a real PostgreSQL database with server-side authentication."*
- **On-Screen Action:** Fill in email and password. Click "Create Character". Show seamless auto-login redirection to `/app`.

---

### Scene 3: The Command Center — Dashboard & Study Room (0:50 – 1:25)
- **Visual:** The Dashboard view (`/app`).
- **Narrator (Audio):**  
  > *"Here is your command center. At the top left, your Character Card displays your current level, dynamic SVG XP ring, gold reserves, and adventurer title. Beside it, the three attribute tracks monitor your balance across Wisdom for studying, Vitality for physical health, and Craft for projects and creative pursuits."*
  > *"Below, behold your Study Room. As you level up, this visual environment literally unlocks new elements: a small succulent at Level 2, desk books at Level 3, a warm glowing lamp at Level 5, a sleeping cat on the windowsill at Level 7, and a sunset panorama at Level 15."*
- **On-Screen Action:** Hover over attribute bars, show responsive tooltips and smooth spring animations.

---

### Scene 4: Quest Management & Creation (1:25 – 1:55)
- **Visual:** The Quests view (`/app/quests`). Filter tabs: All, Quests, Dailies, Habits.
- **Narrator (Audio):**  
  > *"Let's head over to the Quests tab. Here, you can organize your tasks by type: single-time Quests, recurring Dailies, or Habits. Let's create a new quest."*
- **On-Screen Action:**  
  1. Click **"+ New Quest"**.
  2. Modal opens with keyboard trap and focus on Title.
  3. Enter Title: *"Finish Chapter 4 of Data Structures"*.
  4. Select Difficulty: **HARD** (+50 XP, +25 Gold).
  5. Select Attribute: **WISDOM**.
  6. Select Type: **QUEST**.
  7. Click **"Inscribe Quest"**. Card animates into the list with glowing border.

---

### Scene 5: Quest Completion & Server-Side Level-Up (1:55 – 2:30)
- **Visual:** Checking off the quest.
- **Narrator (Audio):**  
  > *"Now for the magic. When you check off a quest, Life RPG executes an optimistic UI update with instant feedback. At the same time, the server securely validates the completion, calculates XP multipliers, applies anti-backfill logic, and increments your streak in an atomic transaction."*
- **On-Screen Action:**  
  1. Click the checkmark circle.
  2. Hear subtle click sound (Web Audio API).
  3. Green `+50 XP` text floats upward.
  4. Full-screen **Level Up Celebration Modal** appears with a confetti burst in warm amber and gold!
  5. Screen reader live-region announces: *"Level Up! You're now Level 2 — Apprentice Scholar"*.
  6. Click "Continue Adventure" to dismiss.
  7. Notice the plant appears on the desk in the study room scene!

---

### Scene 6: Momentum Heatmap & Streaks (2:30 – 2:50)
- **Visual:** Zoom in on the Momentum Heatmap on the Dashboard.
- **Narrator (Audio):**  
  > *"Consistency is power. The Momentum Heatmap tracks your completions across the past 12 weeks with a warm amber gradient inspired by GitHub's contribution graph. Maintaining a 7, 30, or 100-day streak unlocks scaling XP multipliers, rewarding your long-term discipline."*
- **On-Screen Action:** Hover over heatmap cells showing exact dates and completion counts.

---

### Scene 7: The Market & In-Game Economy (2:50 – 3:15)
- **Visual:** Navigate to Market (`/app/market`). Category tabs: Themes, Badges, Decor, Consumables.
- **Narrator (Audio):**  
  > *"What good is gold if you can't spend it? In the Market, you can spend your earned currency on cozy room themes like 'Midnight Study' or 'Sakura Garden', vanity badges, and desk decor. Server-side validation guarantees your balance can never go negative."*
- **On-Screen Action:**  
  1. Browse items. Show gold counter in top right.
  2. Click "Purchase" on *Midnight Study Theme* or *Potted Succulent*.
  3. Hear coin sound chime.
  4. Item instantly transitions to "Equip" button.
  5. Click "Equip" to activate theme.

---

### Scene 8: Profile, Customization & Accessibility (3:15 – 3:35)
- **Visual:** Navigate to Profile (`/app/profile`).
- **Narrator (Audio):**  
  > *"In your Profile, inspect your lifetime adventurer statistics, manage equipped collectibles, toggle sound effects on or off, and adjust your timezone for accurate midnight quest resets. The entire application is 100% keyboard navigable with visible 2px amber focus rings, adheres to strict WCAG 2.1 AA color contrasts, and fully supports prefers-reduced-motion."*
- **On-Screen Action:** Tab through the profile using only the keyboard. Toggle sound test.

---

### Scene 9: Wrap-up & Architecture (3:35 – 3:50)
- **Visual:** Quick montage of mobile view, tablet view, and desktop view.
- **Narrator (Audio):**  
  > *"Built with Next.js App Router, TypeScript, Prisma ORM, PostgreSQL, Tailwind CSS, TanStack Query, and Framer Motion. Zero client-side reward manipulation. Full cross-device persistence. No blank screens. Check out the live deployment link below and turn your life into an adventure today."*
- **Visual:** Fade to black with GitHub repo link and live demo URL.
