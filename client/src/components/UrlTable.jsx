import React, { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Trash2, Edit3, BarChart3, QrCode, Download, Calendar, ExternalLink, Star, Sparkles, Folder, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { deleteUrl, updateUrl } from "../services/urlService";
import { SkeletonTable } from "./SkeletonLoader";

export default function UrlTable({ urls, loading, onRefresh }) {
  const [selectedQr, setSelectedQr] = useState(null); // URL Object for QR Code Modal
  const [editingUrl, setEditingUrl] = useState(null); // URL Object for Edit Modal
  const [editForm, setEditForm] = useState({ originalUrl: "", category: "", expiryDate: "" });
  
const handleCopy = (code) => {
  const fullUrl = `https://urlshortener-jjpy.onrender.com/${code}`;

  navigator.clipboard.writeText(fullUrl);
  toast.success("Shortened link copied to clipboard!");
};

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this link? All visit history will be permanently erased.")) return;
    try {
      await deleteUrl(id);
      toast.success("Short link deleted successfully");
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete link");
    }
  };

  const handleToggleFavorite = async (url) => {
    try {
      await updateUrl(url._id, { isFavorite: !url.isFavorite });
      toast.success(url.isFavorite ? "Removed from Favorites" : "Added to Favorites!");
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error("Failed to update link favorites state");
    }
  };

  const handleStartEdit = (url) => {
    setEditingUrl(url);
    setEditForm({
      originalUrl: url.originalUrl,
      category: url.category || "",
      expiryDate: url.expiryDate ? new Date(url.expiryDate).toISOString().substring(0, 16) : ""
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await updateUrl(editingUrl._id, {
        originalUrl: editForm.originalUrl,
        category: editForm.category,
        expiryDate: editForm.expiryDate || null
      });
      toast.success("Settings updated successfully");
      setEditingUrl(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    }
  };

  const downloadQR = (format) => {
    const svg = document.getElementById("qr-svg-ref");
    if (!svg) return;
    const svgString = new XMLSerializer().serializeToString(svg);
    
    if (format === "svg") {
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qrcode-${selectedQr.shortCode}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "png") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = 300;
        canvas.height = 300;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 300, 300);
        ctx.drawImage(img, 0, 0, 300, 300);
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `qrcode-${selectedQr.shortCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
    }
  };

  if (loading) {
    return <SkeletonTable rows={4} />;
  }

  if (urls.length === 0) {
    return (
      <div className="text-center py-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
        <Sparkles className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-4 font-display">No short links found</h3>
        <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">Shorten your first URL using the field above, or select a different workspace tab.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/50 text-sm text-left">
        <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Link Details</th>
            <th className="px-6 py-4">Short Code</th>
            <th className="px-6 py-4 text-center">Clicks</th>
            <th className="px-6 py-4">Expiry</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
          {urls.map((url) => {
            const fullShort = `${import.meta.env.VITE_API_URL}/${url.shortCode}`;
            return (
              <tr key={url._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors">
                {/* Details */}
                <td className="px-6 py-4 max-w-xs md:max-w-sm">
                  <div className="flex items-start space-x-2">
                    <button
                      onClick={() => handleToggleFavorite(url)}
                      className={`mt-0.5 cursor-pointer focus:outline-none transition ${url.isFavorite ? 'text-yellow-500 scale-110' : 'text-slate-300 hover:text-slate-400 dark:text-slate-700'}`}
                    >
                      <Star className="h-4 w-4" fill={url.isFavorite ? "currentColor" : "none"} />
                    </button>
                    <div className="space-y-1 truncate">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {url.originalUrl}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                        {url.category && (
                          <span className="inline-flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                            <Folder className="h-3 w-3" />
                            <span>{url.category}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Short Code */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-medium text-teal-600 dark:text-teal-400">
                      {url.shortCode}
                    </span>
                    <button
                      onClick={() => handleCopy(url.shortCode)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      title="Copy short link"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={fullShort}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </td>

                {/* Clicks */}
                <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                  {url.clicks}
                </td>

                {/* Expiry */}
                <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                  {url.expiryDate ? new Date(url.expiryDate).toLocaleDateString() : "No Expiry"}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                    url.status === "active"
                      ? "bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400"
                      : url.status === "disabled"
                      ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                    {url.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-slate-400 space-x-1.5">
                  <Link
                    to={`/analytics/${url._id}`}
                    className="inline-flex p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition"
                    title="View Analytics"
                  >
                    <BarChart3 className="h-4.5 w-4.5" />
                  </Link>

                  <button
                    onClick={() => setSelectedQr(url)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition cursor-pointer"
                    title="Generate QR Code"
                  >
                    <QrCode className="h-4.5 w-4.5" />
                  </button>

                  <button
                    onClick={() => handleStartEdit(url)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition cursor-pointer"
                    title="Edit Link Configuration"
                  >
                    <Edit3 className="h-4.5 w-4.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(url._id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    title="Delete Link"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Dynamic QR Code Modal overlay */}
{selectedQr && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4">
    {/* Explicit max-w-sm with over-allocation safety paddings */}
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-sm relative text-center space-y-6 animate-in zoom-in-95 duration-200">
      
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">Dynamic QR Code</h3>
        <p className="text-xs text-slate-400 mt-1">Scan or download your unique link index</p>
      </div>
      
      {/* ⚡ THE CRITICAL FIX: Flex-centered block container with custom bounding padding */}
      <div className="flex justify-center items-center">
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs inline-flex justify-center items-center min-w-[232px] min-h-[232px]">
          <QRCodeSVG
            id="qr-svg-ref"
           value={`${import.meta.env.VITE_API_URL}/${selectedQr.shortCode}`}
            size={200}
            level="H"
            includeMargin={false} // 👈 Disabled outer padding to allow CSS to seamlessly handle boundaries cleanly
            className="w-full h-auto max-w-[200px] max-h-[200px]"
          />
        </div>
      </div>
      
      <p className="text-xs text-slate-500 dark:text-slate-400 break-all font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
        {`${import.meta.env.VITE_API_URL}/${selectedQr.shortCode}`}
      </p>

      <div className="flex gap-3 justify-center">
        <button
          type="button"
          onClick={() => downloadQR("png")}
          className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>PNG Image</span>
        </button>
        <button
          type="button"
          onClick={() => downloadQR("svg")}
          className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center space-x-1.5 transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Vector SVG</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setSelectedQr(null)}
        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition cursor-pointer"
      >
        Close Dashboard Overlay
      </button>
    </div>
  </div>
)}

      {/* Edit URL Modal overlay */}
      {editingUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">Link Settings</h3>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Original Destination URL
                </label>
                <input
                  type="url"
                  required
                  value={editForm.originalUrl}
                  onChange={(e) => setEditForm({ ...editForm, originalUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Category
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Expiry Date
                </label>
                <input
                  type="datetime-local"
                  value={editForm.expiryDate}
                  onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUrl(null)}
                  className="flex-grow py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 bg-gradient-to-r from-teal-500 to-lime-500 text-white rounded-xl text-sm font-semibold shadow shadow-teal-500/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
