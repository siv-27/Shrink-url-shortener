import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getAnalytics } from "../services/analyticsService";
import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import AnimatedBackground from "../components/AnimatedBackground";
import AnalyticsCard from "../components/AnalyticsCard";
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ArrowLeft, Play, Globe, ShieldAlert, Download, Copy, Share2, Eye } from "lucide-react";

const COLORS = ["#0d9488", "#84cc16", "#eab308", "#64748b", "#3b82f6", "#a855f7"];

export default function Analytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  const fetchAnalytics = async () => {
    try {
      const res = await getAnalytics(id);
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const handleCopyLink = () => {
    if (!data?.url) return;
    const fullUrl = `${import.meta.env.VITE_API_URL}/${data.url.shortCode}`;

    navigator.clipboard.writeText(fullUrl);
    toast.success("Short link copied!");
  };

  // Export Analytics to CSV
  const exportToCSV = () => {
    if (!data || data.recentVisits.length === 0) return;
    
    const headers = "Timestamp,IP,Country,City,Browser,Device,OS,Referrer\n";
    const rows = data.recentVisits.map(v => 
      `"${new Date(v.timestamp).toLocaleString()}","${v.ip}","${v.country}","${v.city}","${v.browser}","${v.device}","${v.os}","${v.referrer}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${data.url.shortCode}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded!");
  };

  // Export Analytics dashboard to PDF
  const exportToPDF = async () => {
    if (!reportRef.current) return;
    toast.loading("Generating PDF report...");
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true
      });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 size width
      const pageHeight = 295; // A4 size height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      toast.dismiss();
      pdf.save(`analytics-report-${data.url.shortCode}.pdf`);
      toast.success("PDF report generated successfully!");
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Failed to generate PDF report");
    }
  };

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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-display">Analytics Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400">The link metrics could not be retrieved.</p>
          <Link to="/dashboard" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950/80 pb-16 transition-colors duration-200 relative z-10">
        <AnimatedBackground />
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
          
          {/* Header toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Link to="/dashboard" className="inline-flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase hover:text-teal-600 transition space-x-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportToCSV}
                className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={exportToPDF}
                className="px-3.5 py-2 bg-linear-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <Download className="h-4 w-4" />
                <span>Export PDF Report</span>
              </button>
            </div>
          </div>

          {/* Printable Report Wrapper */}
          <div ref={reportRef} className="space-y-6 pt-2">
            
            {/* Link details header card */}
            <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2 text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Metrics Profile</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display truncate">
                  {data.url.originalUrl}
                </h2>
                <p className="text-xs text-slate-400">
                  Short link code: <strong className="text-teal-500">{data.url.shortCode}</strong>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Link</span>
                </button>
                <Link
                  to={`/stats/${data.url.shortCode}`}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Eye className="h-4 w-4" />
                  <span>Public Stats</span>
                </Link>
              </div>
            </div>

            {/* General metrics widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsCard title="Total Visits" value={data.totalClicks} icon={Play} color="teal" />
              <AnalyticsCard title="Unique Visitors" value={data.uniqueVisitors} icon={Download} color="lime" />
              <AnalyticsCard title="Active Days" value={data.activeDays} icon={Globe} color="slate" />
              <AnalyticsCard title="Last Click Time" value={data.lastVisit ? new Date(data.lastVisit).toLocaleDateString() : "Never"} icon={ShieldAlert} color="yellow" />
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart 1: Click Trends (span 2) */}
              <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-md font-bold text-slate-800 dark:text-white font-display">Daily Click Progression</h3>
                <div className="h-72">
                  {data.dailyTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.dailyTrend}>
                        <defs>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '12px', background: '#1e293b', border: 'none', color: '#fff' }} />
                        <Area type="monotone" dataKey="clicks" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">No click logs registered.</div>
                  )}
                </div>
              </div>

              {/* Chart 2: Devices Pie chart */}
              <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-md font-bold text-slate-800 dark:text-white font-display">Device Types</h3>
                <div className="h-72 flex items-center justify-center">
                  {data.devices.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.devices}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.devices.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-slate-400 text-sm">No device data.</div>
                  )}
                </div>
              </div>

              {/* Chart 3: Browsers Pie chart */}
              <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-md font-bold text-slate-800 dark:text-white font-display">Browsers</h3>
                <div className="h-72 flex items-center justify-center">
                  {data.browsers.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.browsers}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {data.browsers.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-slate-400 text-sm">No browser data.</div>
                  )}
                </div>
              </div>

              {/* Chart 4: Referrers Bar chart */}
              <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm space-y-4 lg:col-span-2">
                <h3 className="text-md font-bold text-slate-800 dark:text-white font-display">Top Referral Sources</h3>
                <div className="h-72">
                  {data.referrers.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.referrers}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '12px', background: '#1e293b', border: 'none', color: '#fff' }} />
                        <Bar dataKey="value" fill="#84cc16" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">No referral data.</div>
                  )}
                </div>
              </div>

              {/* Chart 5: Countries breakdown */}
              <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-md font-bold text-slate-800 dark:text-white font-display">Location Breakdown</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/30 text-xs">
                  {data.countries.length === 0 ? (
                    <p className="text-slate-400 py-4 text-center">No location metrics.</p>
                  ) : (
                    data.countries.slice(0, 6).map((c, i) => (
                      <div key={i} className="py-2.5 flex justify-between items-center">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{c.name}</span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">{c.value} clicks</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Visits log table */}
            <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-md font-bold text-slate-800 dark:text-white font-display">Recent Click Visits Logs</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-left">
                  <thead className="text-slate-400 font-bold uppercase">
                    <tr>
                      <th className="py-3 px-2">Time</th>
                      <th className="py-3 px-2">IP</th>
                      <th className="py-3 px-2">Country/City</th>
                      <th className="py-3 px-2">Device/OS</th>
                      <th className="py-3 px-2">Browser</th>
                      <th className="py-3 px-2">Referrer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 text-slate-700 dark:text-slate-300">
                    {data.recentVisits.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">No visits logged.</td>
                      </tr>
                    ) : (
                      data.recentVisits.map((v) => (
                        <tr key={v._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="py-3 px-2 whitespace-nowrap">{new Date(v.timestamp).toLocaleString()}</td>
                          <td className="py-3 px-2 font-mono">{v.ip}</td>
                          <td className="py-3 px-2">{v.country} / {v.city}</td>
                          <td className="py-3 px-2 uppercase">{v.device} - {v.os}</td>
                          <td className="py-3 px-2">{v.browser}</td>
                          <td className="py-3 px-2 truncate max-w-xs">{v.referrer}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}