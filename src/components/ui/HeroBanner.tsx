import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeroBannerProps {
  badgeText?: string;
  title: string;
  titleHighlight?: string;
  description: string;
  actions?: React.ReactNode;
  stats?: Array<{ label: string; value: string; subtext?: string }>;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  badgeText = 'Sistem Operasional Kasir & Inventaris Toko',
  title,
  titleHighlight,
  description,
  actions,
  stats,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm mb-8 transition-colors">
      {/* Visual Radial Glow adaptif */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-blue-500/10 dark:bg-blue-600/20 blur-[90px] rounded-full pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          {badgeText && (
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{badgeText}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            {title}{' '}
            {titleHighlight && (
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300 bg-clip-text text-transparent">
                {titleHighlight}
              </span>
            )}
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl">
            {description}
          </p>

          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
        </div>

        {/* Stats Grid: Terang di Light Mode, Gelap di Dark Mode */}
        {stats && stats.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between min-h-[96px] hover:border-blue-300 dark:hover:border-slate-600 transition-colors shadow-2xs"
              >
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                    {stat.value}
                  </p>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1.5 leading-snug">
                    {stat.label}
                  </p>
                </div>
                {stat.subtext && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium leading-tight truncate" title={stat.subtext}>
                    {stat.subtext}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
