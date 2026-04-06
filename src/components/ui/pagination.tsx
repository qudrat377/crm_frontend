"use client";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
interface PaginationProps { page: number; totalPages: number; total: number; limit: number; onPageChange: (p: number) => void; }
export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const start = (page-1)*limit+1, end = Math.min(page*limit, total);
  const pages: (number|"...")[] = [];
  if (totalPages <= 7) { for(let i=1;i<=totalPages;i++) pages.push(i); }
  else { pages.push(1); if(page>3) pages.push("..."); for(let i=Math.max(2,page-1);i<=Math.min(totalPages-1,page+1);i++) pages.push(i); if(page<totalPages-2) pages.push("..."); pages.push(totalPages); }
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100 dark:border-surface-800">
      <p className="text-sm text-surface-500 dark:text-surface-400">{start}–{end} / {total} ta</p>
      <div className="flex items-center gap-1">
        <button disabled={page===1} onClick={()=>onPageChange(page-1)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4 text-surface-600 dark:text-surface-400"/></button>
        {pages.map((p,i)=>p==="..."?<span key={i} className="px-2 text-surface-400 dark:text-surface-500 text-sm">…</span>:<button key={i} onClick={()=>onPageChange(p as number)} className={cn("w-8 h-8 rounded-lg text-sm font-medium transition-colors",p===page?"bg-brand-600 text-white":"hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-200")}>{p}</button>)}
        <button disabled={page===totalPages} onClick={()=>onPageChange(page+1)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4 text-surface-600 dark:text-surface-400"/></button>
      </div>
    </div>
  );
}
