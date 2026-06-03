import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import PageTransition from "../components/PageTransition";
import AnimatedBackground from "../components/AnimatedBackground";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Successfully logged in!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 px-6 py-12 transition-colors duration-200 relative z-10">
        <AnimatedBackground />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-teal-500/10 dark:from-teal-500/5 blur-3xl rounded-full -z-10"></div>
        
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md space-y-6">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-2 font-display text-2xl font-bold bg-linear-to-r from-teal-600 to-lime-600 dark:from-teal-400 dark:to-lime-400 bg-clip-text text-transparent mb-3">
              SHRINK
            </Link>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-display">
              Welcome back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Sign in to manage and analyze your links
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
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
                  {...register("email")}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25 ${errors.email ? 'border-red-500' : 'border-slate-200/70 dark:border-slate-800/70'}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-0.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/25 ${errors.password ? 'border-red-500' : 'border-slate-200/70 dark:border-slate-800/70'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}