import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bot, ShieldCheck, Send, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandBotModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { botInfo } = useApp();
  const botHandle = botInfo?.username ? `@${botInfo.username}` : 'the KITYBUILDER brand bot';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/80 p-4 text-left backdrop-blur-sm animate-fade-in">
      <div role="dialog" aria-modal="true" aria-labelledby="brand-bot-title" className="relative my-auto w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-slate-700/80 bg-[#17212b] p-5 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close brand bot guide"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 id="brand-bot-title" className="text-base font-bold text-white">Use the KITYBUILDER Bot</h3>
            <p className="text-xs text-slate-400">No personal bot token is needed.</p>
          </div>
        </div>

        {/* Brand bot status */}
        <div className="p-3.5 my-3 rounded-2xl bg-[#0e1621] border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2.5 h-2.5 rounded-full ${botInfo ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></div>
            <span className="text-xs font-semibold text-slate-200">
              {botInfo ? `@${botInfo.username}` : 'Brand bot information is loading'}
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            botInfo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}>
            {botInfo ? 'Ready' : 'Checking'}
          </span>
        </div>

        {/* Channel permission guide */}
        <div className="bg-[#0e1621]/60 p-3.5 rounded-2xl border border-slate-800/80 text-xs text-slate-300 space-y-3 mb-4">
          <p className="font-semibold text-sky-400">Connect your channel in 3 steps</p>
          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-300">1</span>
            <span>Open your Telegram channel settings and choose <b>Administrators</b>.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-300">2</span>
            <span>Add <b>{botHandle}</b> as an administrator and allow <b>Post Messages</b>.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-300">3</span>
            <span>Return here, tap <b>Add Channel</b>, then enter your channel username or ID.</span>
          </div>
        </div>

        {!botInfo && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>The brand bot must be configured by the site owner before channels can be connected.</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Your token is never requested
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-sky-400"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
