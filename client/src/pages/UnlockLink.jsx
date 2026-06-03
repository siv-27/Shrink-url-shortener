import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { unlockUrl } from "../services/urlService";
import toast from "react-hot-toast";
import PageTransition from "../components/PageTransition";
import { Lock, ArrowRight } from "lucide-react";

export default function UnlockLink() {
  const { shortCode } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    try {
      const res = await unlockUrl(shortCode, password);
      toast.success("Correct password! Redirecting...");
      
      // Perform the redirect in browser
      let target = res.data.originalUrl;
      if (!/^https?:\/\//i.test(target)) {
        target = `http://${target}`;
      }
      window.location.href = target;
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-12 transition-colors duration-200">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-2xl shadow-xl w-full max-w-md text-center space-y-6">
          <div className="bg-teal-500/10 p-4 rounded-full w-fit mx-auto text-teal-600">
            <Lock className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-display">Link Protected</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              The short link <strong>{shortCode}</strong> requires a password to view.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <input
                type="password"
                placeholder="Enter password to unlock"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-500/25"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Unlock & Redirect</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
