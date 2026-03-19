import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: React.ReactNode;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <div className={className}>
      {items.map((it, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} className="inline-flex items-center">
            {it.onClick ? (
              <button type="button" onClick={it.onClick} className="hover:underline text-[10px] text-slate-500">
                {it.label}
              </button>
            ) : (
              <span className={`text-[10px] ${isLast ? 'font-medium text-slate-700' : 'text-slate-500'}`}>{it.label}</span>
            )}

            {!isLast && <ChevronRight className="h-3 w-3 text-slate-400 mx-1" />}
          </span>
        );
      })}
    </div>
  );
}
