import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-sm flex items-center space-x-4">
      <div className="skeleton w-14 h-14 rounded-xl shrink-0" />
      <div className="flex-grow space-y-2">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-7 w-16" />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr>
      <td className="px-6 py-4"><div className="flex items-center space-x-2"><div className="skeleton w-4 h-4 rounded" /><div className="space-y-1.5"><div className="skeleton h-4 w-48" /><div className="skeleton h-3 w-24" /></div></div></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-16" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-8 mx-auto" /></td>
      <td className="px-6 py-4"><div className="skeleton h-3 w-20" /></td>
      <td className="px-6 py-4"><div className="skeleton h-5 w-14 rounded-full" /></td>
      <td className="px-6 py-4"><div className="flex justify-end space-x-1.5"><div className="skeleton w-7 h-7 rounded-lg" /><div className="skeleton w-7 h-7 rounded-lg" /><div className="skeleton w-7 h-7 rounded-lg" /><div className="skeleton w-7 h-7 rounded-lg" /></div></td>
    </tr>
  );
}

export function SkeletonTable({ rows = 4 }) {
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
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
