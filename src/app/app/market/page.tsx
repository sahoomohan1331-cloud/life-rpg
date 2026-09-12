"use client";

import { useState } from "react";
import { useMarketItems, usePurchaseItem, useEquipItem } from "@/hooks/use-market";
import { useCharacter } from "@/hooks/use-character";
import { useSoundContext } from "@/components/providers/sound-provider";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Coins, ShoppingBag, Check, Sparkles, Loader2 } from "lucide-react";
import type { MarketItem } from "@/types";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "THEME", label: "🎨 Themes" },
  { value: "BADGE", label: "🏅 Badges" },
  { value: "DECOR", label: "🪴 Decor" },
  { value: "CONSUMABLE", label: "📜 Consumables" },
];

export default function MarketPage() {
  const [category, setCategory] = useState("");
  const { data: items, isLoading } = useMarketItems(category || undefined);
  const { data: character } = useCharacter();
  const purchaseItem = usePurchaseItem();
  const equipItem = useEquipItem();
  const { playCoin } = useSoundContext();

  async function handlePurchase(item: MarketItem) {
    if (item.owned) return;
    if (!character || character.gold < item.price) {
      toast.error("Not enough Gold!");
      return;
    }

    try {
      await purchaseItem.mutateAsync(item.id);
      playCoin();
      toast.success(`Purchased ${item.name}! 🎉`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Purchase failed");
    }
  }

  async function handleEquip(itemId: string) {
    try {
      await equipItem.mutateAsync(itemId);
      toast.success("Item updated!");
    } catch {
      toast.error("Failed to equip item");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-brown-deep">Market</h1>
        {character && (
          <div className="flex items-center gap-1.5 bg-parchment px-4 py-2 rounded-[8px] border border-amber-warm/15">
            <Coins className="h-4 w-4 text-gold" aria-hidden="true" />
            <span className="font-mono font-semibold text-brown-dark">{character.gold}</span>
            <span className="text-sm text-brown-soft">Gold</span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Filter items by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            role="tab"
            aria-selected={category === cat.value}
            className={`px-3 py-1.5 text-sm rounded-[6px] font-medium transition-colors ${
              category === cat.value
                ? "bg-amber-warm/20 text-brown-deep"
                : "text-brown-soft hover:text-brown-dark hover:bg-amber-warm/10"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 skeleton-pulse rounded-[12px]" />
          ))}
        </div>
      ) : !items || items.length === 0 ? (
        <div className="text-center py-16 bg-parchment rounded-[16px] border border-amber-warm/15">
          <ShoppingBag className="h-16 w-16 text-amber-warm/30 mx-auto mb-4" aria-hidden="true" />
          <h3 className="font-heading text-xl font-semibold text-brown-deep mb-2">
            No items available
          </h3>
          <p className="text-brown-soft">Check back later for new items!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {items.map((item) => (
              <MarketItemCard
                key={item.id}
                item={item}
                canAfford={!!character && character.gold >= item.price}
                onPurchase={() => handlePurchase(item)}
                onEquip={() => handleEquip(item.id)}
                isPurchasing={purchaseItem.isPending}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function MarketItemCard({
  item,
  canAfford,
  onPurchase,
  onEquip,
  isPurchasing,
}: {
  item: MarketItem;
  canAfford: boolean;
  onPurchase: () => void;
  onEquip: () => void;
  isPurchasing: boolean;
}) {
  const effect = item.effectJson as Record<string, unknown> | null;
  const emoji = (effect?.emoji as string) || "✨";
  const description = (effect?.description as string) || item.name;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-parchment rounded-[12px] p-5 border border-amber-warm/10 hover:border-amber-warm/25 transition-all flex flex-col"
    >
      {/* Icon */}
      <div className="text-4xl mb-3">{emoji}</div>

      {/* Info */}
      <h3 className="font-heading text-base font-semibold text-brown-deep mb-1">{item.name}</h3>
      <p className="text-xs text-brown-soft mb-3 flex-1">{description}</p>

      {/* Category badge */}
      <span className="text-xs text-brown-soft bg-cream px-2 py-0.5 rounded-full w-fit mb-3 border border-amber-warm/10">
        {item.category}
      </span>

      {/* Price & Action */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1">
          <Coins className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
          <span className="font-mono text-sm font-semibold text-brown-dark">{item.price}</span>
        </div>

        {item.owned ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-muted font-medium flex items-center gap-1">
              <Check className="h-3 w-3" aria-hidden="true" /> Owned
            </span>
            {item.category !== "CONSUMABLE" && (
              <button
                onClick={onEquip}
                className={`text-xs px-3 py-1 rounded-[6px] font-medium transition-colors ${
                  item.equipped
                    ? "bg-green-muted/20 text-green-muted"
                    : "bg-cream text-brown-soft hover:bg-amber-warm/10"
                }`}
              >
                {item.equipped ? "Equipped" : "Equip"}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onPurchase}
            disabled={!canAfford || isPurchasing}
            className="px-4 py-1.5 text-sm bg-amber-warm text-brown-deep font-semibold rounded-[6px] hover:bg-amber-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            aria-label={`Buy ${item.name} for ${item.price} gold`}
          >
            {isPurchasing ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            ) : (
              "Buy"
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
