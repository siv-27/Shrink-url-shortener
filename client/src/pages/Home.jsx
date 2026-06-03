import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, BarChart3, ShieldAlert, Zap, Users, Shield, Sparkles } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function Home() {
  const { user } = useAuth();

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950/80 font-sans transition-colors duration-200 relative z-10">
        <AnimatedBackground />
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-28 px-6 text-center">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-teal-500/10 to-lime-500/10 dark:from-teal-500/5 dark:to-lime-500/5 blur-3xl rounded-full -z-10"></div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 bg-teal-50 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-800/30 px-3 py-1.5 rounded-full text-xs font-semibold text-teal-700 dark:text-teal-400">
              <Sparkles className="h-3 w-3" />
              <span>Next Generation URL Shortener SaaS</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Transform Long Links<br/>
              <span className="bg-linear-to-r from-teal-500 to-lime-500 bg-clip-text text-transparent">
                Into Powerful Insights
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              SHRINK is the premium URL shortener trusted by marketers, developers, and teams worldwide. Create secure links, track every click, and analyze visitor behavior in real-time.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-teal-500/20 flex items-center space-x-2 transition font-display"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-teal-500/20 flex items-center space-x-2 transition font-display"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>

                  <Link
                    to="/login"
                    className="border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold transition font-display"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="max-w-7xl mx-auto py-24 px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white font-display">
              Enterprise-Grade Features
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Everything you need to optimize, secure, and monitor your shared links on the web.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="bg-teal-500/10 p-3 rounded-xl w-fit">
                <Zap className="h-6 w-6 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-white font-display">
                Instant Redirections
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Supercharge your routing using standard HTTP 302 redirects optimized for negligible server latency.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="bg-lime-500/10 p-3 rounded-xl w-fit">
                <BarChart3 className="h-6 w-6 text-lime-500" />
              </div>
              <h3 className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-white font-display">
                Advanced Real-time Analytics
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Track devices, browsers, systems, referrers, and detailed geolocations with clear interactive charts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="bg-yellow-500/10 p-3 rounded-xl w-fit">
                <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-white font-display">
                Link Password Protection
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Restrict access to sensitive URL paths by setting secure verification passwords.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="bg-teal-500/10 p-3 rounded-xl w-fit">
                <Users className="h-6 w-6 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-white font-display">
                Team Workspaces
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Collaborate with coworkers on URL categories, tag assets, and shared link analytics profiles.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="bg-lime-500/10 p-3 rounded-xl w-fit">
                <ShieldAlert className="h-6 w-6 text-lime-500" />
              </div>
              <h3 className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-white font-display">
                Expiry & Status Control
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Configure auto-expiration timetables or manually deactivate your shortened URLs with ease.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="bg-yellow-500/10 p-3 rounded-xl w-fit">
                <Sparkles className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-white font-display">
                Dynamic QR Generation
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Instantly produce QR codes for every generated short URL, ready to download in SVG or PNG formats.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-6 space-y-4">
            <p className="font-bold font-display tracking-wide text-slate-700 dark:text-slate-300">ShortLink Pro</p>
            <p>© {new Date().getFullYear()} ShortLink Pro. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}