"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Sparkles,
  LayoutDashboard,
  Scroll,
  ShoppingBag,
  User,
  LogOut,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSoundContext } from "@/components/providers/sound-provider";

const NAV_ITEMS = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/quests", label: "Quests", icon: Scroll },
  { href: "/app/market", label: "Market", icon: ShoppingBag },
  { href: "/app/profile", label: "Profile", icon: User },
];

export function AppNav() {
  const pathname = usePathname();
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundContext();

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        className="hidden md:flex flex-col w-64 bg-parchment border-r border-amber-warm/15 min-h-screen p-4"
        aria-label="Main navigation"
      >
        <Link
          href="/app"
          className="flex items-center gap-2 font-heading text-xl font-bold text-brown-deep mb-8 px-3"
        >
          <Sparkles className="h-6 w-6 text-amber-warm" aria-hidden="true" />
          Life RPG
        </Link>

        <ul className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all",
                    isActive
                      ? "bg-amber-warm/20 text-brown-deep"
                      : "text-brown-soft hover:text-brown-dark hover:bg-amber-warm/10"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="space-y-1 pt-4 border-t border-amber-warm/15">
          <button
            onClick={toggleSound}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-brown-soft hover:text-brown-dark hover:bg-amber-warm/10 transition-all w-full"
            aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" aria-hidden="true" />
            ) : (
              <VolumeX className="h-5 w-5" aria-hidden="true" />
            )}
            {soundEnabled ? "Sound On" : "Sound Off"}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-brown-soft hover:text-ember hover:bg-ember/5 transition-all w-full"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Log Out
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-parchment border-t border-amber-warm/15 z-50 safe-bottom"
        aria-label="Mobile navigation"
      >
        <ul className="flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[8px] text-xs transition-all",
                    isActive
                      ? "text-amber-warm font-semibold"
                      : "text-brown-soft"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
