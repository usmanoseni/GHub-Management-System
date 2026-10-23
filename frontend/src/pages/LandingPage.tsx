
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Dumbbell,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Building2,
    title: "Multi-Gym Management",
    description:
      "Manage your gym centers and branches from one organized platform.",
  },
  {
    icon: Users,
    title: "Member Management",
    description:
      "Keep member records organized and make daily gym operations easier.",
  },
  {
    icon: BarChart3,
    title: "Business Insights",
    description:
      "Get a clear overview of your gym operations and business performance.",
  },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#082b3c] text-white">
              <Dumbbell size={23} />
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-[#082b3c]">
              GHub
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-600 hover:text-[#10b981]">
              Features
            </a>
            <a href="#benefits" className="text-sm text-slate-600 hover:text-[#10b981]">
              Benefits
            </a>
            <a href="#about" className="text-sm text-slate-600 hover:text-[#10b981]">
              About
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2.5 font-semibold text-[#082b3c] hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#10b981] px-5 py-3 font-semibold text-white transition hover:bg-emerald-600"
            >
              Get started <ArrowRight className="ml-1 inline" size={17} />
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-[#082b3c] md:hidden"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {menuOpen && (
          <div className="grid gap-4 border-t border-slate-100 px-6 py-5 md:hidden">
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#benefits" onClick={() => setMenuOpen(false)}>Benefits</a>
            <Link to="/login">Sign in</Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#10b981] px-4 py-3 text-center font-semibold text-white"
            >
              Get started
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <main>
        <section className="overflow-hidden bg-gradient-to-br from-[#082b3c] via-[#0b3b4c] to-[#082b3c] text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                Smarter gym management starts here
              </span>

              <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Run your gym.
                <span className="block text-[#10b981]">
                  Grow your business.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Manage gym branches, employees, instructors, and members
                with one simple platform built to keep your fitness business
                organized.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="rounded-xl bg-[#10b981] px-6 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-500"
                >
                  Create your account <ArrowRight className="ml-2 inline" size={18} />
                </Link>

                <a
                  href="#features"
                  className="rounded-xl border border-white/20 px-6 py-4 font-semibold text-white transition hover:bg-white/10"
                >
                  Explore features
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                <span><CheckCircle2 className="mr-2 inline text-[#10b981]" size={17} />Organized operations</span>
                <span><CheckCircle2 className="mr-2 inline text-[#10b981]" size={17} />Multi-branch support</span>
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/20 sm:p-5">
              <div className="rounded-xl bg-white p-5 text-slate-900 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Overview</p>
                    <h2 className="mt-1 text-xl font-bold">Gym dashboard</h2>
                  </div>
                  <span className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                    <BarChart3 size={24} />
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Gym branches</p>
                    <p className="mt-2 text-3xl font-extrabold text-[#082b3c]">04</p>
                    <p className="mt-1 text-xs text-emerald-600">Branch overview</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Members</p>
                    <p className="mt-2 text-3xl font-extrabold text-[#082b3c]">248</p>
                    <p className="mt-1 text-xs text-emerald-600">Member overview</p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Weekly activity</p>
                    <span className="text-xs text-slate-400">Illustration</span>
                  </div>
                  <div className="mt-5 flex h-32 items-end justify-around gap-3">
                    {[40, 65, 48, 85, 58, 95, 72].map((height, index) => (
                      <div
                        key={index}
                        className="w-full rounded-t-md bg-[#10b981]"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-around text-xs text-slate-400">
                    {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                      <span key={index}>{day}</span>
                    ))}
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-400">
                  Sample dashboard data — not live business records.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-bold uppercase tracking-widest text-emerald-600">
              Everything in one place
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-[#082b3c] sm:text-4xl">
              Simplify the way you manage your gym
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Spend less time organizing operations and more time building
              a better experience for your members.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 p-7 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon size={25} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-[#082b3c]">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="bg-slate-50 px-6 py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
            <div>
              <p className="font-bold uppercase tracking-widest text-emerald-600">
                Built for gym owners
              </p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight text-[#082b3c] sm:text-4xl">
                Your entire gym operation, working together.
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                GHub brings the essential parts of your gym business into
                one organized workflow, helping you manage teams, branches,
                and membership records more efficiently.
              </p>
            </div>

            <div id="about" className="space-y-4">
              {[
                "Manage multiple gym branches",
                "Organize employees and instructors",
                "Keep member information accessible",
                "Review operations from a central dashboard",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                  <CheckCircle2 className="shrink-0 text-emerald-500" size={22} />
                  <span className="font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl rounded-3xl bg-[#082b3c] px-6 py-14 text-center text-white sm:px-12">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Ready to manage your gym smarter?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
              Bring your gym operations together with GHub.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center rounded-xl bg-[#10b981] px-6 py-4 font-bold text-white hover:bg-emerald-500"
            >
              Get started today <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} GHub. All rights reserved.</p>
          <p>Smarter management for modern fitness businesses.</p>
        </div>
      </footer>
    </div>
  );
}
