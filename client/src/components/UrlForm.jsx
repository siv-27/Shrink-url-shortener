import React, { useState } from "react";
import { createUrl } from "../services/urlService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Link2, Sparkles, Calendar, Lock, Tag, Folder, Plus, ChevronDown, ChevronUp } from "lucide-react";

export default function UrlForm({ onUrlCreated }) {
  const { activeWorkspace } = useAuth();
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [password, setPassword] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    setLoading(true);
    try {
      const tags = tagsInput
        ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      
      const payload = {
        originalUrl,
        customAlias: customAlias || undefined,
        password: password || undefined,
        expiryDate: expiryDate || undefined,
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
        workspaceId: activeWorkspace?._id || undefined
      };

      const res = await createUrl(payload);
      toast.success("Short link created successfully!");
      setOriginalUrl("");
      setCustomAlias("");
      setPassword("");
      setExpiryDate("");
      setCategory("");
      setTagsInput("");
      setShowAdvanced(false);
      
      if (onUrlCreated) onUrlCreated(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm transition">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL Input */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Link2 className="h-5 w-5" />
            </span>
            <input
              type="url"
              placeholder="Paste your long URL here (e.g. https://example.com/very/long/path)..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="md:w-36 py-3.5 px-6 bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer font-display"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Shorten</span>
              </>
            )}
          </button>
        </div>

        {/* Expandable Advanced Options */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 cursor-pointer"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span>Advanced Configuration (Optional)</span>
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in duration-200">
              {/* Custom Alias */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Custom Alias
                </label>
                <input
                  type="text"
                  placeholder="e.g. promo2026"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Expiry Date</span>
                </label>
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                />
              </div>

              {/* Password Protection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Password Protection</span>
                </label>
                <input
                  type="password"
                  placeholder="Leave empty for public access"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Folder className="h-3.5 w-3.5" />
                  <span>Category</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marketing, Personal"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Tags (Comma-separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. winter, sale, ads"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
