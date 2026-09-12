"use client";

import { useState } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { useEquipItem } from "@/hooks/use-market";
import { useSoundContext } from "@/components/providers/sound-provider";
import { signOut } from "next-auth/react";
import {
  User,
  Sparkles,
  Trophy,
  Flame,
  Coins,
  Volume2,
  VolumeX,
  Globe,
  LogOut,
  ShoppingBag,
  Check,
  Loader2,
  Clock,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const equipItem = useEquipItem();
  const { enabled: soundEnabled, toggle: toggleSound, playComplete } = useSoundContext();
  const [selectedTimezone, setSelectedTimezone] = useState<string>("");

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full skeleton-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 skeleton-pulse rounded-[4px]" />
              <div className="h-4 w-32 skeleton-pulse rounded-[4px]" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-parchment rounded-[12px] skeleton-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto text-center py-12 bg-parchment rounded-[16px] p-6 border border-amber-warm/15">
        <p className="text-brown-dark font-medium mb-4">Failed to load profile.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-amber-warm text-cream rounded-[8px] text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  const { user, character, stats, inventory } = profile;
  const currentTimezone = selectedTimezone || user.timezone || "UTC";

  const handleTimezoneChange = async (newTz: string) => {
    setSelectedTimezone(newTz);
    try {
      await updateProfile.mutateAsync({ timezone: newTz });
      toast.success("Timezone updated!");
    } catch {
      toast.error("Failed to update timezone");
    }
  };

  const handleEquipToggle = async (itemId: string, itemName: string, isEquipped: boolean) => {
    try {
      await equipItem.mutateAsync(itemId);
      toast.success(isEquipped ? `Unequipped ${itemName}` : `Equipped ${itemName}!`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to toggle equip");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <section
        className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm"
        aria-labelledby="profile-heading"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-warm/20 border-2 border-amber-warm flex items-center justify-center text-amber-warm shadow-inner flex-shrink-0">
              <User className="h-8 w-8" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 id="profile-heading" className="font-heading text-2xl font-bold text-brown-deep">
                  {character.title}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-warm/20 text-brown-deep font-semibold border border-amber-warm/30">
                  Level {character.level}
                </span>
              </div>
              <p className="text-sm text-brown-soft mt-0.5">{user.email}</p>
              <p className="text-xs text-brown-soft/70 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Adventuring since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cream rounded-[10px] border border-amber-warm/20 text-gold font-mono font-semibold">
              <Coins className="h-4 w-4" aria-hidden="true" />
              <span>{formatNumber(character.gold)} Gold</span>
            </div>
          </div>
        </div>
      </section>

      {/* Lifetime Stats */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="text-sm font-semibold text-brown-soft uppercase tracking-wider mb-3">
          Adventurer Statistics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-parchment rounded-[12px] p-4 border border-amber-warm/15 text-center">
            <Trophy className="h-5 w-5 text-amber-warm mx-auto mb-1" aria-hidden="true" />
            <p className="font-mono text-xl font-bold text-brown-deep">
              {formatNumber(stats.totalCompletions)}
            </p>
            <p className="text-xs text-brown-soft mt-0.5">Quests Completed</p>
          </div>

          <div className="bg-parchment rounded-[12px] p-4 border border-amber-warm/15 text-center">
            <Sparkles className="h-5 w-5 text-green-muted mx-auto mb-1" aria-hidden="true" />
            <p className="font-mono text-xl font-bold text-brown-deep">
              {formatNumber(stats.totalXp)}
            </p>
            <p className="text-xs text-brown-soft mt-0.5">Total XP Earned</p>
          </div>

          <div className="bg-parchment rounded-[12px] p-4 border border-amber-warm/15 text-center">
            <Flame className="h-5 w-5 text-ember mx-auto mb-1" aria-hidden="true" />
            <p className="font-mono text-xl font-bold text-brown-deep">
              {stats.currentStreak} <span className="text-xs font-normal text-brown-soft">days</span>
            </p>
            <p className="text-xs text-brown-soft mt-0.5">Current Momentum</p>
          </div>

          <div className="bg-parchment rounded-[12px] p-4 border border-amber-warm/15 text-center">
            <Shield className="h-5 w-5 text-gold mx-auto mb-1" aria-hidden="true" />
            <p className="font-mono text-xl font-bold text-brown-deep">
              {stats.longestStreak} <span className="text-xs font-normal text-brown-soft">days</span>
            </p>
            <p className="text-xs text-brown-soft mt-0.5">Longest Momentum</p>
          </div>
        </div>
      </section>

      {/* Settings */}
      <section
        className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm space-y-6"
        aria-labelledby="settings-heading"
      >
        <h2 id="settings-heading" className="font-heading text-lg font-bold text-brown-deep">
          Preferences & Settings
        </h2>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-amber-warm/10">
          <div>
            <p className="text-sm font-medium text-brown-dark">Audio Sound Effects</p>
            <p className="text-xs text-brown-soft">
              Play chimes and feedback for quest completions, coin gains, and level ups
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                toggleSound();
                if (!soundEnabled) {
                  setTimeout(() => playComplete(), 100);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-[8px] text-xs font-medium transition-colors ${
                soundEnabled
                  ? "bg-green-muted/15 text-green-muted border border-green-muted/30"
                  : "bg-cream text-brown-soft border border-amber-warm/20"
              }`}
              aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span>Sound Enabled</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  <span>Muted</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Timezone */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-amber-warm/10">
          <div>
            <p className="text-sm font-medium text-brown-dark flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-amber-warm" />
              Timezone
            </p>
            <p className="text-xs text-brown-soft">
              Used for daily quest resets and momentum streak tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={currentTimezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              disabled={updateProfile.isPending}
              className="bg-cream border border-amber-warm/20 rounded-[8px] px-3 py-2 text-xs font-medium text-brown-dark focus:ring-2 focus:ring-amber-warm focus:outline-none"
              aria-label="Select timezone"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin text-amber-warm" />}
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section
        className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm"
        aria-labelledby="inventory-heading"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="inventory-heading" className="font-heading text-lg font-bold text-brown-deep">
              Inventory & Collectibles
            </h2>
            <p className="text-xs text-brown-soft">Items acquired from the Market</p>
          </div>
          <Link
            href="/app/market"
            className="flex items-center gap-1.5 text-xs font-medium text-amber-warm hover:text-amber-warm/80 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Market
          </Link>
        </div>

        {inventory.length === 0 ? (
          <div className="text-center py-8 bg-cream/60 rounded-[12px] border border-amber-warm/10 p-6">
            <ShoppingBag className="h-10 w-10 text-amber-warm/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-brown-dark">Your inventory is currently empty</p>
            <p className="text-xs text-brown-soft mt-1 mb-4">
              Complete quests to earn gold and purchase cozy room themes, badges, and decor!
            </p>
            <Link
              href="/app/market"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-warm text-cream rounded-[8px] text-xs font-medium hover:bg-amber-warm/90 transition-all"
            >
              Visit Market
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {inventory.map((item) => (
              <div
                key={item.id}
                className="bg-cream rounded-[12px] p-3.5 border border-amber-warm/15 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider text-brown-soft uppercase px-2 py-0.5 bg-amber-warm/10 rounded-full">
                      {item.category}
                    </span>
                    <p className="font-medium text-sm text-brown-dark mt-1.5">{item.name}</p>
                  </div>
                  {item.equipped && (
                    <span className="text-[10px] font-medium text-green-muted bg-green-muted/10 border border-green-muted/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="h-3 w-3" /> Equipped
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleEquipToggle(item.itemId, item.name, item.equipped)}
                  disabled={equipItem.isPending}
                  className={`w-full py-1.5 rounded-[8px] text-xs font-medium transition-colors ${
                    item.equipped
                      ? "bg-amber-warm/15 text-brown-deep hover:bg-amber-warm/25"
                      : "bg-amber-warm text-cream hover:bg-amber-warm/90"
                  }`}
                  aria-label={item.equipped ? `Unequip ${item.name}` : `Equip ${item.name}`}
                >
                  {item.equipped ? "Unequip" : "Equip"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Account actions */}
      <section
        className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm flex items-center justify-between"
        aria-labelledby="account-heading"
      >
        <div>
          <h2 id="account-heading" className="text-sm font-semibold text-brown-deep">
            Account Session
          </h2>
          <p className="text-xs text-brown-soft mt-0.5">Signed in as {user.email}</p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-xs font-medium text-ember bg-ember/10 hover:bg-ember/20 transition-colors focus:ring-2 focus:ring-ember"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </section>
    </div>
  );
}
