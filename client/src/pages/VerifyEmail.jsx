import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import PageTransition from "../components/PageTransition";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus("error");
        return;
      }
      try {
        await api.get(`/auth/verify/${token}`);
        setStatus("success");
        toast.success("Email verified successfully!");
      } catch (err) {
        setStatus("error");
        toast.error(err.response?.data?.message || "Verification failed");
      }
    };
    performVerification();
  }, [token]);

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-12 transition-colors duration-200">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-2xl shadow-xl w-full max-w-md text-center space-y-6">
          {status === "loading" && (
            <div className="space-y-4 py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white font-display">Verifying Email...</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Please wait while we confirm your credentials.</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6 py-4">
              <CheckCircle2 className="h-16 w-16 text-teal-500 mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-display">Verified!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Your email address has been successfully verified.</p>
              </div>
              <Link
                to="/login"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6 py-4">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-display">Verification Failed</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">The link is invalid or has expired.</p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Go to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
