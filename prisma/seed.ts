import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_ITEMS = [
  // Themes
  {
    name: "Midnight Study",
    category: "THEME" as const,
    price: 100,
    assetUrl: null,
    effectJson: { theme: "midnight", description: "A deep blue night theme for your study room" },
  },
  {
    name: "Sakura Garden",
    category: "THEME" as const,
    price: 150,
    assetUrl: null,
    effectJson: { theme: "sakura", description: "Cherry blossoms and soft pink hues" },
  },
  {
    name: "Forest Cabin",
    category: "THEME" as const,
    price: 200,
    assetUrl: null,
    effectJson: { theme: "forest", description: "Deep greens and woodland warmth" },
  },

  // Badges
  {
    name: "Early Bird",
    category: "BADGE" as const,
    price: 50,
    assetUrl: null,
    effectJson: { badge: "early-bird", emoji: "🐦", description: "For those who rise before the sun" },
  },
  {
    name: "Night Owl",
    category: "BADGE" as const,
    price: 50,
    assetUrl: null,
    effectJson: { badge: "night-owl", emoji: "🦉", description: "For those who study under the stars" },
  },
  {
    name: "Streak Master",
    category: "BADGE" as const,
    price: 75,
    assetUrl: null,
    effectJson: { badge: "streak-master", emoji: "🔥", description: "Proof of unwavering dedication" },
  },
  {
    name: "Bookworm",
    category: "BADGE" as const,
    price: 60,
    assetUrl: null,
    effectJson: { badge: "bookworm", emoji: "📚", description: "A true lover of knowledge" },
  },

  // Decor
  {
    name: "Potted Succulent",
    category: "DECOR" as const,
    price: 30,
    assetUrl: null,
    effectJson: { decor: "succulent", emoji: "🪴", description: "A tiny green companion for your desk" },
  },
  {
    name: "Vintage Globe",
    category: "DECOR" as const,
    price: 60,
    assetUrl: null,
    effectJson: { decor: "globe", emoji: "🌍", description: "Dream of distant lands between quests" },
  },
  {
    name: "Fairy Lights",
    category: "DECOR" as const,
    price: 45,
    assetUrl: null,
    effectJson: { decor: "fairy-lights", emoji: "✨", description: "Warm twinkling lights for ambiance" },
  },
  {
    name: "Vinyl Player",
    category: "DECOR" as const,
    price: 80,
    assetUrl: null,
    effectJson: { decor: "vinyl", emoji: "🎵", description: "Lo-fi beats to study to" },
  },
  {
    name: "Tea Set",
    category: "DECOR" as const,
    price: 35,
    assetUrl: null,
    effectJson: { decor: "tea-set", emoji: "🍵", description: "A warm cup of tea for study sessions" },
  },

  // Consumables
  {
    name: "XP Scroll (2x)",
    category: "CONSUMABLE" as const,
    price: 100,
    assetUrl: null,
    effectJson: { xpMultiplier: 2, duration: "1h", emoji: "📜", description: "Double XP for the next hour" },
  },
  {
    name: "Gold Charm (2x)",
    category: "CONSUMABLE" as const,
    price: 100,
    assetUrl: null,
    effectJson: { goldMultiplier: 2, duration: "1h", emoji: "🪙", description: "Double gold for the next hour" },
  },
];

async function main() {
  console.log("🌱 Seeding market items...");

  for (const item of SEED_ITEMS) {
    const id = item.name.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
    const data = {
      ...item,
      effectJson: item.effectJson ? JSON.stringify(item.effectJson) : null,
    };
    await prisma.item.upsert({
      where: { id },
      update: data,
      create: {
        id,
        ...data,
      },
    });
  }

  console.log(`✅ Seeded ${SEED_ITEMS.length} market items`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
