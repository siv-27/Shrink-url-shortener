import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import toast from "react-hot-toast";
import PageTransition from "../components/PageTransition";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Reset link generated! Check server logs.");
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-12 transition-colors duration-200">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
          <div className="text-center">
            <Link to="/login" className="inline-flex items-center text-xs font-semibold text-slate-500 uppercase hover:text-teal-600 space-x-1 mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-display">
              Reset Password
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {sent
                ? "If an account exists, a reset link has been outputted to the server logs."
                : "Enter your email address to obtain a recovery link."}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                  />
                </div>
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
                    <span>Send Reset Instructions</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-center space-y-3">
              <p className="text-xs text-slate-500">
                [Developer Note] Check your backend command line console to view and copy the simulated password recovery hyperlink.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
              >
                Try different email
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
