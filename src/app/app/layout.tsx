import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { SoundProvider } from "@/components/providers/sound-provider";
import { AppNav } from "@/components/shared/app-nav";
import { GlobalShortcuts } from "@/components/shared/global-shortcuts";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Life RPG",
  },
  robots: "noindex, nofollow",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <QueryProvider>
        <SoundProvider>
          <div className="min-h-screen bg-cream flex flex-col md:flex-row">
            <AppNav />
            <main className="flex-1 pb-20 md:pb-0 overflow-auto">
              <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
                {children}
              </div>
            </main>
          </div>
          <GlobalShortcuts />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#F5E6D3",
                border: "1px solid rgba(212, 165, 116, 0.3)",
                color: "#5C4033",
                fontFamily: "Inter, system-ui, sans-serif",
              },
            }}
          />
        </SoundProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
