import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const numValue = typeof value === "number" ? value : 0;

  useEffect(() => {
    if (typeof value !== "number") return;
    const duration = 800;
    const start = 0;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (numValue - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [numValue, value]);

  if (typeof value !== "number") return value;
  return display.toLocaleString();
}

export default function AnalyticsCard({ title, value, icon: Icon, subtext, color = "teal", index = 0 }) {
  const colorMap = {
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    lime: "bg-lime-500/10 text-lime-600 dark:text-lime-400",
    yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
    slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center space-x-4 cursor-default"
    >
      <div className={`p-3.5 rounded-xl ${colorMap[color] || colorMap.teal}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white font-display leading-tight">
          <AnimatedNumber value={value} />
        </h3>
        {subtext && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtext}</p>
        )}
      </div>
    </motion.div>
  );
}
