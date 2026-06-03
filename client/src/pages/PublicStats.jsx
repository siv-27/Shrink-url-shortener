import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicStats } from "../services/analyticsService";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import PageTransition from "../components/PageTransition";
import AnimatedBackground from "../components/AnimatedBackground";
import { BarChart3, Clock, Globe } from "lucide-react";

export default function PublicStats() {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getPublicStats(shortCode);
        setData(res.data);
      } catch (err) {
        console.error("Public stats error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-center px-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-display">Stats Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400">The short code might be invalid, private, or disabled.</p>
          <Link to="/" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950/80 py-12 px-6 transition-colors duration-200 relative z-10">
        <AnimatedBackground />
        <div className="max-w-4xl mx-auto space-y-8 font-sans">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
              Public Link Performance
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Statistics for short code: <strong className="text-teal-600 dark:text-teal-400">{shortCode}</strong>
            </p>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-teal-500/10 rounded-xl text-teal-600">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Clicks</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{data.totalClicks}</h3>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-lime-500/10 rounded-xl text-lime-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Last Clicked</p>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                  {data.lastVisit ? new Date(data.lastVisit).toLocaleString() : "Never visited"}
                </h3>
              </div>
            </div>
          </div>

          {/* Daily clicks chart */}
          <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 font-display">Daily Click Trend</h3>
            <div className="h-64">
              {data.dailyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyTrend}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', background: '#1e293b', border: 'none', color: '#fff' }} />
                    <Area type="monotone" dataKey="clicks" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No clicks registered yet.
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <Link to="/" className="text-sm font-medium text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 flex items-center justify-center space-x-1">
              <Globe className="h-4 w-4" />
              <span>Create your own short links with ShortLink Pro</span>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
