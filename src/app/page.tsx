import Link from "next/link";
import { Sparkles, Target, TrendingUp, ShoppingBag, Flame, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2 font-heading text-2xl font-bold text-brown-deep">
          <Sparkles className="h-7 w-7 text-amber-warm" aria-hidden="true" />
          Life RPG
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-brown-soft hover:text-brown-deep transition-colors font-medium"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 bg-amber-warm text-brown-deep font-semibold rounded-[12px] hover:bg-amber-dark transition-colors shadow-sm"
          >
            Start Your Adventure
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main>
        <section className="px-6 pt-16 pb-24 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-parchment text-brown-soft rounded-full text-sm font-medium mb-6">
            <Flame className="h-4 w-4 text-ember" aria-hidden="true" />
            Turn real tasks into RPG quests
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-brown-deep leading-tight mb-6">
            Your Life,{" "}
            <span className="text-amber-warm">Your Adventure</span>
          </h1>
          <p className="text-lg md:text-xl text-brown-soft max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform everyday tasks into epic quests. Earn XP, level up your character,
            unlock items in the Market, and watch your cozy study room grow — all while
            building real habits that stick.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-amber-warm text-brown-deep font-bold text-lg rounded-[12px] hover:bg-amber-dark transition-all hover:shadow-lg shadow-sm"
            >
              Begin Your Journey
            </Link>
            <Link
              href="#features"
              className="px-8 py-3.5 bg-parchment text-brown-soft font-semibold text-lg rounded-[12px] hover:bg-amber-light/40 transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </section>

        {/* Visual Study Room Preview */}
        <section className="px-6 pb-20 max-w-4xl mx-auto">
          <div className="bg-parchment rounded-[20px] p-8 md:p-12 shadow-lg border border-amber-warm/20 relative overflow-hidden">
            <div className="grid grid-cols-3 gap-4 md:gap-6 text-center">
              {/* Desk area */}
              <div className="col-span-3 bg-cream/80 rounded-[12px] p-6 border border-amber-warm/10">
                <div className="text-6xl mb-3">📚</div>
                <p className="font-heading text-lg font-semibold text-brown-deep">Your Study Room</p>
                <p className="text-brown-soft text-sm mt-1">Grows as you level up — from a bare desk to a cozy sanctuary</p>
              </div>
              <div className="bg-cream/80 rounded-[12px] p-4 border border-amber-warm/10">
                <div className="text-3xl mb-2">🪴</div>
                <p className="text-sm font-medium text-brown-dark">Plants Grow</p>
                <p className="text-xs text-brown-soft">Level 2</p>
              </div>
              <div className="bg-cream/80 rounded-[12px] p-4 border border-amber-warm/10">
                <div className="text-3xl mb-2">🐱</div>
                <p className="text-sm font-medium text-brown-dark">Cat Appears</p>
                <p className="text-xs text-brown-soft">Level 7</p>
              </div>
              <div className="bg-cream/80 rounded-[12px] p-4 border border-amber-warm/10">
                <div className="text-3xl mb-2">🌅</div>
                <p className="text-sm font-medium text-brown-dark">Sunset View</p>
                <p className="text-xs text-brown-soft">Level 15</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 pb-24 max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-brown-deep text-center mb-4">
            Everything You Need to Level Up
          </h2>
          <p className="text-brown-soft text-center max-w-xl mx-auto mb-12">
            A complete RPG progression system built around your real-life goals.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Epic Quests",
                desc: "Create tasks as Quests, Dailies, or Habits. Pick difficulty and earn rewards that match your effort.",
                color: "text-ember",
              },
              {
                icon: TrendingUp,
                title: "XP & Leveling",
                desc: "Earn XP with every completion. Watch your character level up and unlock new titles and room upgrades.",
                color: "text-green-muted",
              },
              {
                icon: Sparkles,
                title: "Three Attributes",
                desc: "Build Wisdom, Vitality, and Craft independently. Each quest strengthens the attribute you choose.",
                color: "text-amber-warm",
              },
              {
                icon: Flame,
                title: "Momentum Streaks",
                desc: "Keep your streak alive for bonus XP multipliers. 7 days, 30 days, 100 days — each milestone rewards more.",
                color: "text-ember",
              },
              {
                icon: ShoppingBag,
                title: "The Market",
                desc: "Spend your hard-earned Gold on themes, badges, room decor, and power-ups in the cozy Market.",
                color: "text-gold",
              },
              {
                icon: Shield,
                title: "Fair Play",
                desc: "All XP is computed server-side with anti-cheat. Daily caps and streak validation keep progression honest.",
                color: "text-green-dark",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-parchment rounded-[12px] p-6 border border-amber-warm/10 hover:border-amber-warm/30 transition-all hover:shadow-md"
              >
                <feature.icon className={`h-8 w-8 ${feature.color} mb-4`} aria-hidden="true" />
                <h3 className="font-heading text-xl font-semibold text-brown-deep mb-2">
                  {feature.title}
                </h3>
                <p className="text-brown-soft text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-24 max-w-3xl mx-auto text-center">
          <div className="bg-parchment rounded-[20px] p-10 border border-amber-warm/20 shadow-md">
            <h2 className="font-heading text-3xl font-bold text-brown-deep mb-4">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-brown-soft mb-8">
              Join the quest. Build real habits. Level up your life.
            </p>
            <Link
              href="/signup"
              className="inline-block px-10 py-4 bg-amber-warm text-brown-deep font-bold text-lg rounded-[12px] hover:bg-amber-dark transition-all hover:shadow-lg shadow-sm"
            >
              Create Your Character
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-amber-warm/10 text-center">
        <p className="text-brown-soft text-sm">
          © {new Date().getFullYear()} Life RPG — Built with 🧡 for adventurers everywhere
        </p>
      </footer>
    </div>
  );
}
