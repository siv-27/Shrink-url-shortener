import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import UrlForm from "../components/UrlForm";
import UrlTable from "../components/UrlTable";
import AnalyticsCard from "../components/AnalyticsCard";
import PageTransition from "../components/PageTransition";
import AnimatedBackground from "../components/AnimatedBackground";
import { SkeletonCard } from "../components/SkeletonLoader";
import toast from "react-hot-toast";
import { getUrls, bulkCreateUrls } from "../services/urlService";
import { createWorkspace, inviteWorkspaceMember, removeWorkspaceMember, deleteWorkspace, getAdminMetrics, getAdminUrls, getAdminUsers, toggleAbusiveUrl } from "../services/analyticsService";
import { generateApiKey, deleteApiKey, updateProfile, changePassword, deleteAccount } from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import { Link2, Layers, Key, Settings, ShieldAlert, Plus, Users, Shield, Copy, Trash2, Search, SlidersHorizontal, ArrowUpRight, BarChart3, Star, Download, Play, CheckCircle, Sun, Moon } from "lucide-react";

export default function Dashboard() {
  const { user, workspaces, activeWorkspace, auditLogs, reloadWorkspaces, fetchProfile, switchWorkspace, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "links";
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Settings states
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Tab 1: Links states
  const [urls, setUrls] = useState([]);
  const [urlsLoading, setUrlsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);

  // Tab 2: Workspaces states
  const [newWsName, setNewWsName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteLoading, setInviteLoading] = useState(false);

  // Tab 3: API keys states
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState(null);

  // Tab 5: Admin metrics states
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUrls, setAdminUrls] = useState([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminUrlsPage, setAdminUrlsPage] = useState(1);
  const [adminUrlsTotalPages, setAdminUrlsTotalPages] = useState(1);

  // Links stats summary
  const [summaryStats, setSummaryStats] = useState({ totalLinks: 0, totalClicks: 0, activeLinks: 0, expiredLinks: 0 });

  // Add useEffect to initialize profile form when user loads
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      await updateProfile({ name: profileName, email: profileEmail });
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      return toast.error("New passwords do not match");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setSettingsLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This will delete all your links, analytics, and data. This action CANNOT be undone.")) return;
    if (!window.confirm("This is your FINAL confirmation. All data will be lost forever. Proceed?")) return;
    try {
      await deleteAccount();
      toast.success("Account deleted successfully");
      logout();
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    }
  };

  // Fetch standard URLs for active workspace
  const fetchUrls = async () => {
    setUrlsLoading(true);
    try {
      const res = await getUrls({
        page,
        limit: 8,
        search: search || undefined,
        category: categoryFilter || undefined,
        favorite: onlyFavorites ? "true" : undefined,
        sortBy,
        order: "desc",
        workspaceId: activeWorkspace?._id || undefined
      });
      setUrls(res.data.urls);
      setTotalPages(res.data.totalPages);

      // Compute simple stats for current view
      const allRes = await getUrls({
        limit: 1000,
        workspaceId: activeWorkspace?._id || undefined
      });
      const allUrls = allRes.data.urls;
      const totalClicks = allUrls.reduce((sum, u) => sum + u.clicks, 0);
      const activeLinks = allUrls.filter(u => u.status === "active").length;
      const expiredLinks = allUrls.filter(u => u.status === "expired" || (u.expiryDate && new Date(u.expiryDate) < new Date())).length;
      
      setSummaryStats({
        totalLinks: allUrls.length,
        totalClicks,
        activeLinks,
        expiredLinks
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load short links");
    } finally {
      setUrlsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "links") {
      fetchUrls();
    }
  }, [page, search, categoryFilter, onlyFavorites, sortBy, activeWorkspace, activeTab]);

  // Load Admin Data
  const fetchAdminData = async () => {
    if (user?.role !== "admin") return;
    try {
      const metRes = await getAdminMetrics();
      setAdminMetrics(metRes.data);

      const usrRes = await getAdminUsers();
      setAdminUsers(usrRes.data);

      const urlRes = await getAdminUrls({ page: adminUrlsPage, limit: 10, search: adminSearch });
      setAdminUrls(urlRes.data.urls);
      setAdminUrlsTotalPages(urlRes.data.totalPages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin logs");
    }
  };

  useEffect(() => {
    if (activeTab === "admin") {
      fetchAdminData();
    }
  }, [activeTab, adminUrlsPage, adminSearch]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // CSV Bulk Upload
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) return;

    const formData = new FormData();
    formData.append("file", bulkFile);

    try {
      const res = await bulkCreateUrls(formData);
      setBulkResult(res.data);
      toast.success(`Bulk upload completed! Success: ${res.data.successCount}, Fail: ${res.data.failCount}`);
      setBulkFile(null);
      fetchUrls();
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk creation failed");
    }
  };

  // Workspace actions
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    try {
      await createWorkspace(newWsName.trim());
      toast.success("Team Workspace created!");
      setNewWsName("");
      reloadWorkspaces();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create workspace");
    }
  };

  const handleInviteMember = async (e, wsId) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    try {
      await inviteWorkspaceMember(wsId, inviteEmail.trim(), inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail("");
      reloadWorkspaces();
    } catch (err) {
      toast.error(err.response?.data?.message || "Invitation failed");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (wsId, memberUserId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeWorkspaceMember(wsId, memberUserId);
      toast.success("Member removed successfully");
      reloadWorkspaces();
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  const handleDeleteWorkspace = async (wsId) => {
    if (!window.confirm("Are you sure you want to delete this workspace? This action is irreversible.")) return;
    try {
      await deleteWorkspace(wsId);
      toast.success("Workspace deleted");
      switchWorkspace(null);
      reloadWorkspaces();
    } catch (err) {
      toast.error("Failed to delete workspace");
    }
  };

  // API Key actions
  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await generateApiKey(newKeyName.trim());
      setGeneratedKey(res.data.key);
      setNewKeyName("");
      fetchProfile();
      toast.success("API Key generated successfully!");
    } catch (err) {
      toast.error("Failed to generate key");
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (!window.confirm("Are you sure you want to revoke this API key? Services utilizing it will immediately break.")) return;
    try {
      await deleteApiKey(keyId);
      toast.success("API Key revoked");
      fetchProfile();
    } catch (err) {
      toast.error("Failed to revoke API key");
    }
  };

  // Admin Flag actions
  const handleToggleAbusive = async (urlId) => {
    try {
      await toggleAbusiveUrl(urlId);
      toast.success("URL safety status toggled!");
      fetchAdminData();
    } catch (err) {
      toast.error("Admin toggle failed");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950/80 pb-20 transition-colors duration-200 relative z-10">
        <AnimatedBackground />
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
          {/* Side Tabs Selector */}
          <aside className="w-full md:w-64 shrink-0 flex flex-col space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider font-display">
              Management
            </div>
            <button
              onClick={() => handleTabChange("links")}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${activeTab === "links" ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"}`}
            >
              <Link2 className="h-5 w-5" />
              <span>Short Links</span>
            </button>
            <button
              onClick={() => handleTabChange("workspaces")}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${activeTab === "workspaces" ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"}`}
            >
              <Layers className="h-5 w-5" />
              <span>Team Workspaces</span>
            </button>
            <button
              onClick={() => handleTabChange("api")}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${activeTab === "api" ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"}`}
            >
              <Key className="h-5 w-5" />
              <span>Developer APIs</span>
            </button>
            <button
              onClick={() => handleTabChange("settings")}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${activeTab === "settings" ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"}`}
            >
              <Settings className="h-5 w-5" />
              <span>Account Settings</span>
            </button>

            {user?.role === "admin" && (
              <>
                <div className="px-3 py-2 pt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider font-display">
                  Administration
                </div>
                <button
                  onClick={() => handleTabChange("admin")}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${activeTab === "admin" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"}`}
                >
                  <ShieldAlert className="h-5 w-5" />
                  <span>Admin Dashboard</span>
                </button>
              </>
            )}
          </aside>

          {/* Core Tab Panels */}
          <main className="flex-grow min-w-0 space-y-6">
            
            {/* PANEL 1: LINKS */}
            {activeTab === "links" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <AnalyticsCard title="Total Links" value={summaryStats.totalLinks} icon={Link2} color="teal" />
                  <AnalyticsCard title="Total Clicks" value={summaryStats.totalClicks} icon={Play} color="lime" />
                  <AnalyticsCard title="Active Links" value={summaryStats.activeLinks} icon={CheckCircle} color="slate" />
                  <AnalyticsCard title="Expired Links" value={summaryStats.expiredLinks} icon={ShieldAlert} color="yellow" />
                </div>

                {/* Form Wrapper */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white font-display">Shorten a new link</h2>
                    <button
                      onClick={() => setBulkModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                    >
                      Bulk CSV Import
                    </button>
                  </div>
                  <UrlForm onUrlCreated={fetchUrls} />
                </div>

                {/* Table Filters header */}
                <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Search className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search links..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white w-48 focus:outline-none"
                      />
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Category filter..."
                      value={categoryFilter}
                      onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
                    />

                    <button
                      onClick={() => { setOnlyFavorites(!onlyFavorites); setPage(1); }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center space-x-1 cursor-pointer transition ${onlyFavorites ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                      <Star className="h-3.5 w-3.5" fill={onlyFavorites ? "currentColor" : "none"} />
                      <span>Favorites Only</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-2 px-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="createdAt">Sort: Created Date</option>
                      <option value="clicks">Sort: Total Clicks</option>
                    </select>
                  </div>
                </div>

                {/* Main Links Data Table */}
                <UrlTable urls={urls} loading={urlsLoading} onRefresh={fetchUrls} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-50 cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-slate-400">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PANEL 2: TEAM WORKSPACES */}
            {activeTab === "workspaces" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-display">Create Team Workspace</h2>
                  <form onSubmit={handleCreateWorkspace} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="e.g. Marketing Team, Acme Corp"
                      value={newWsName}
                      onChange={(e) => setNewWsName(e.target.value)}
                      required
                      className="flex-grow px-4 py-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none"
                    />
                    <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-5 rounded-xl text-sm cursor-pointer">
                      Create Space
                    </button>
                  </form>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">Your Teams</h3>
                  {workspaces.length === 0 ? (
                    <div className="text-center py-10 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                      You are not part of any team workspaces.
                    </div>
                  ) : (
                    workspaces.map((ws) => {
                      const isOwner = ws.ownerId?._id === user?._id;
                      return (
                        <div key={ws._id} className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl space-y-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-md font-bold text-slate-800 dark:text-white font-display">{ws.name}</h4>
                              <p className="text-xs text-slate-400">Owner: {ws.ownerId?.email} {isOwner && "(You)"}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { switchWorkspace(ws._id); navigate("/dashboard?tab=links"); }}
                                className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                              >
                                Enter Workspace
                              </button>
                              {isOwner && (
                                <button
                                  onClick={() => handleDeleteWorkspace(ws._id)}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 cursor-pointer"
                                  title="Delete Workspace"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Member addition */}
                          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            {/* Invite user */}
                            <div className="space-y-3">
                              <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Invite Coworker</h5>
                              <form onSubmit={(e) => handleInviteMember(e, ws._id)} className="space-y-3">
                                <input
                                  type="email"
                                  placeholder="coworker@company.com"
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                  required
                                  className="w-full px-3 py-2 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none"
                                />
                                <div className="flex gap-3">
                                  <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
                                  >
                                    <option value="member">Role: Member</option>
                                    <option value="admin">Role: Admin</option>
                                  </select>
                                  <button
                                    type="submit"
                                    disabled={inviteLoading}
                                    className="flex-grow py-1.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg text-xs cursor-pointer"
                                  >
                                    Add Member
                                  </button>
                                </div>
                              </form>
                            </div>

                            {/* Members list */}
                            <div className="space-y-3">
                              <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Team Members ({ws.members.length})</h5>
                              <div className="divide-y divide-slate-100 dark:divide-slate-800/30 max-h-48 overflow-y-auto pr-1">
                                {ws.members.map((m) => (
                                  <div key={m._id} className="py-2 flex justify-between items-center text-xs">
                                    <div>
                                      <p className="font-semibold text-slate-800 dark:text-slate-200">{m.userId?.name}</p>
                                      <p className="text-slate-400">{m.userId?.email}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-semibold uppercase tracking-wider scale-95">
                                        {m.role}
                                      </span>
                                      {isOwner && (
                                        <button
                                          onClick={() => handleRemoveMember(ws._id, m.userId?._id)}
                                          className="text-red-500 hover:underline cursor-pointer"
                                        >
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* PANEL 3: DEVELOPER API KEY */}
            {activeTab === "api" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-display">Developer API Keys</h2>
                  <p className="text-xs text-slate-500">Expose credentials to generate short links from terminal clients, CI servers, or custom integrations.</p>

                  <form onSubmit={handleGenerateKey} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="e.g. Local Server Key, Web App Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      required
                      className="flex-grow px-4 py-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none"
                    />
                    <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-5 rounded-xl text-sm cursor-pointer">
                      Generate Key
                    </button>
                  </form>

                  {/* Render generated key once */}
                  {generatedKey && (
                    <div className="bg-teal-500/10 border border-teal-500/30 p-4 rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-teal-800 dark:text-teal-300">Copy this API key. For security, it will not be shown again:</p>
                      <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <code className="text-teal-400 font-mono text-xs break-all flex-grow">{generatedKey}</code>
                        <button
                          onClick={() => { navigator.clipboard.writeText(generatedKey); toast.success("API Key copied!"); }}
                          className="text-teal-400 hover:text-white transition cursor-pointer"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl space-y-4">
                  <h3 className="text-md font-bold text-slate-800 dark:text-white font-display">Active Keys</h3>
                  {user?.apiKeys?.length === 0 ? (
                    <p className="text-xs text-slate-400">No developer API keys active yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/30 text-xs">
                      {user?.apiKeys?.map((key) => (
                        <div key={key._id} className="py-3 flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{key.name}</p>
                            <p className="text-slate-400">Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                            <p className="text-slate-400 font-mono scale-95 origin-left">Key prefix: {key.key.substring(0, 12)}...</p>
                          </div>
                          <button
                            onClick={() => handleRevokeKey(key._id)}
                            className="text-rose-500 font-semibold hover:underline cursor-pointer"
                          >
                            Revoke
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* API Docs integration example */}
                <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl space-y-4">
                  <h3 className="text-md font-bold text-slate-800 dark:text-white font-display">Documentation Example</h3>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500">Shorten links programmatically using headers authentication:</p>
                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-teal-400 font-mono text-[10px] md:text-xs overflow-x-auto leading-relaxed">
{`curl -X POST http://localhost:5000/api/url/create \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY_HERE" \\
  -d '{"originalUrl": "https://google.com", "customAlias": "api-demo"}'`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 4: ACCOUNT SETTINGS & AUDIT FEED */}
            {activeTab === "settings" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Profile Settings */}
                <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-display">Profile Settings</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={settingsLoading}
                        className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white font-semibold rounded-xl text-sm shadow shadow-teal-500/20 cursor-pointer disabled:opacity-50"
                      >
                        {settingsLoading ? "Saving..." : "Save Changes"}
                      </button>
                      <span className="text-xs text-slate-400">Role: <strong className="uppercase">{user?.role}</strong> · Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                    </div>
                  </form>
                </div>

                {/* Change Password */}
                <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-display">Change Password</h2>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        placeholder="Enter your current password"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          placeholder="At least 6 characters"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          required
                          placeholder="Re-enter new password"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={settingsLoading}
                      className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white font-semibold rounded-xl text-sm shadow shadow-teal-500/20 cursor-pointer disabled:opacity-50"
                    >
                      {settingsLoading ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>

                {/* Theme Switcher */}
                <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-display">Appearance</h2>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dark Mode</p>
                      <p className="text-xs text-slate-400">Toggle between light and dark theme</p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative w-14 h-7 rounded-full transition-colors duration-300 cursor-pointer ${
                        theme === "dark" ? "bg-teal-500" : "bg-slate-300"
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ${
                        theme === "dark" ? "translate-x-7.5" : "translate-x-0.5"
                      }`}>
                        {theme === "dark" ? <Moon className="h-3.5 w-3.5 text-teal-600" /> : <Sun className="h-3.5 w-3.5 text-yellow-500" />}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl space-y-4">
                  <h3 className="text-md font-bold text-slate-800 dark:text-white font-display">Activity Feed & Audit Log</h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/30 text-xs max-h-80 overflow-y-auto pr-1">
                    {auditLogs.length === 0 ? (
                      <p className="text-slate-400 py-4 text-center">No activity history logged yet.</p>
                    ) : (
                      auditLogs.map((log) => (
                        <div key={log._id} className="py-2.5 flex justify-between items-center">
                          <div className="space-y-0.5">
                            <span className="inline-block bg-teal-500/10 text-teal-600 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider font-display uppercase">
                              {log.action}
                            </span>
                            <p className="text-slate-700 dark:text-slate-300">{log.details}</p>
                          </div>
                          <span className="text-slate-400 shrink-0 text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Danger Zone - Delete Account */}
                <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/30 p-6 rounded-2xl space-y-4">
                  <h2 className="text-lg font-bold text-red-600 dark:text-red-400 font-display">Danger Zone</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Permanently delete your account and all associated data including links, analytics, and workspaces. This action cannot be undone.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm cursor-pointer shadow shadow-red-500/20"
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            )}

            {/* PANEL 5: ADMIN DASHBOARD */}
            {activeTab === "admin" && user?.role === "admin" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {adminMetrics && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <AnalyticsCard title="Total Platform Users" value={adminMetrics.totalUsers} icon={Users} color="teal" />
                    <AnalyticsCard title="Global Created Links" value={adminMetrics.totalUrls} icon={Link2} color="slate" />
                    <AnalyticsCard title="Global Click Visits" value={adminMetrics.totalClicks} icon={Play} color="lime" />
                    <AnalyticsCard title="Disabled Links" value={adminMetrics.disabledUrls} icon={ShieldAlert} color="yellow" />
                  </div>
                )}

                {/* Users Directory */}
                <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl space-y-4 shadow-sm">
                  <h3 className="text-md font-bold text-slate-800 dark:text-white font-display">System Users Directory ({adminUsers.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-left">
                      <thead>
                        <tr className="text-slate-400 font-bold uppercase">
                          <th className="py-3 px-2">Name</th>
                          <th className="py-3 px-2">Email</th>
                          <th className="py-3 px-2">Role</th>
                          <th className="py-3 px-2">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 text-slate-700 dark:text-slate-300">
                        {adminUsers.map(usr => (
                          <tr key={usr._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                            <td className="py-3.5 px-2 font-semibold">{usr.name}</td>
                            <td className="py-3.5 px-2">{usr.email}</td>
                            <td className="py-3.5 px-2 uppercase font-medium">{usr.role}</td>
                            <td className="py-3.5 px-2">{new Date(usr.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* System URLs Administration */}
                <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl space-y-4 shadow-sm">
                  <h3 className="text-md font-bold text-slate-800 dark:text-white font-display">Global System URLs</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search code or destination URL..."
                      value={adminSearch}
                      onChange={(e) => { setAdminSearch(e.target.value); setAdminUrlsPage(1); }}
                      className="flex-grow px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/50 text-xs text-left">
                      <thead>
                        <tr className="text-slate-400 font-bold uppercase">
                          <th className="py-3 px-2">Creator</th>
                          <th className="py-3 px-2">Destination URL</th>
                          <th className="py-3 px-2">Code</th>
                          <th className="py-3 px-2 text-center">Clicks</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 text-slate-700 dark:text-slate-300">
                        {adminUrls.map(url => (
                          <tr key={url._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                            <td className="py-3.5 px-2">
                              <p className="font-semibold">{url.userId?.name}</p>
                              <p className="text-[10px] text-slate-400">{url.userId?.email}</p>
                            </td>
                            <td className="py-3.5 px-2 max-w-xs truncate">{url.originalUrl}</td>
                            <td className="py-3.5 px-2 font-mono font-bold text-teal-600 dark:text-teal-400">{url.shortCode}</td>
                            <td className="py-3.5 px-2 text-center font-bold">{url.clicks}</td>
                            <td className="py-3.5 px-2 text-right">
                              <button
                                onClick={() => handleToggleAbusive(url._id)}
                                className={`px-2 py-1.5 rounded text-[10px] font-bold cursor-pointer ${url.status === "disabled" ? 'bg-teal-500/10 text-teal-500' : 'bg-red-500/10 text-red-500'}`}
                              >
                                {url.status === "disabled" ? "Active" : "Block Link"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {adminUrlsTotalPages > 1 && (
                    <div className="flex justify-between items-center pt-2">
                      <button
                        disabled={adminUrlsPage === 1}
                        onClick={() => setAdminUrlsPage(p => Math.max(p - 1, 1))}
                        className="px-2 py-1 bg-white border rounded text-[10px]"
                      >
                        Prev
                      </button>
                      <span className="text-[10px]">Page {adminUrlsPage} of {adminUrlsTotalPages}</span>
                      <button
                        disabled={adminUrlsPage === adminUrlsTotalPages}
                        onClick={() => setAdminUrlsPage(p => Math.min(p + 1, adminUrlsTotalPages))}
                        className="px-2 py-1 bg-white border rounded text-[10px]"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Bulk upload CSV Modal overlay */}
        {bulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4 animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">Bulk URL Shortening</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload a CSV file containing your links to generate short URLs in bulk.
                The CSV file should have columns matching: <strong>originalUrl, alias</strong>.
              </p>

              <form onSubmit={handleBulkUpload} className="space-y-4">
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 focus:outline-none"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setBulkModalOpen(false); setBulkResult(null); }}
                    className="flex-grow py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-2.5 bg-gradient-to-r from-teal-500 to-lime-500 text-white rounded-xl text-sm font-semibold shadow shadow-teal-500/20 cursor-pointer"
                  >
                    Import CSV
                  </button>
                </div>
              </form>

              {/* Show bulk execution metrics */}
              {bulkResult && (
                <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4 space-y-2 text-xs">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Execution Results:</p>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-teal-500/10 p-2.5 border border-teal-500/20 rounded-lg text-teal-600 font-bold">
                      <p>Created</p>
                      <h4 className="text-lg mt-0.5">{bulkResult.successCount}</h4>
                    </div>
                    <div className="bg-red-500/10 p-2.5 border border-red-500/20 rounded-lg text-red-500 font-bold">
                      <p>Failed</p>
                      <h4 className="text-lg mt-0.5">{bulkResult.failCount}</h4>
                    </div>
                  </div>
                  {bulkResult.failures.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-800 rounded-lg max-h-24 overflow-y-auto text-[10px] space-y-1">
                      {bulkResult.failures.map((f, i) => (
                        <p key={i} className="text-red-500 leading-tight">
                          Row {i + 1}: {f.error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}