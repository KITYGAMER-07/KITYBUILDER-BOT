import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Globe, Moon, Sun, Zap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, theme, setTheme } = useApp();
  const [logoUnavailable, setLogoUnavailable] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#111923]/95 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sky-400/30 bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600">
              {logoUnavailable ? (
                <Zap className="h-5 w-5 text-white" aria-hidden="true" />
              ) : (
                <img
                  src="/logo.jpg"
                  alt="KITYBUILDER"
                  className="h-full w-full object-cover"
                  onError={() => setLogoUnavailable(true)}
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="hidden truncate text-base font-extrabold tracking-wide text-white min-[360px]:inline sm:text-lg">KITYBUILDER</span>
                <span className="hidden rounded-full border border-sky-500/30 bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-400 min-[420px]:inline">
                  Studio
                </span>
              </div>
              <p className="-mt-0.5 hidden text-[11px] text-slate-400 sm:block">
                Posting studio for Telegram channels
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex min-h-9 items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/90 px-2 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 sm:px-2.5"
              title="Switch Language"
              aria-label="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden min-[420px]:inline">{language === 'en' ? 'EN' : 'தமிழ்'}</span>
            </button>

            {/* Theme Switch */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'telegram' : 'dark')}
              className="flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/90 p-1.5 text-slate-300 transition hover:bg-slate-700"
              title="Switch Theme"
              aria-label="Switch theme"
            >
              {theme === 'telegram' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-sky-400" />
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
