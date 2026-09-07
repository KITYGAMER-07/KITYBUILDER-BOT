import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Send,
  BellOff,
  Pin,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { activeChannel, publishPost, isPublishing, setCurrentView } = useApp();
  const [silent, setSilent] = useState(false);
  const [pinMessage, setPinMessage] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleClose = () => {
    setPublishResult(null);
    setSilent(false);
    setPinMessage(false);
    onClose();
  };

  if (!isOpen) return null;

  const handlePublish = async () => {
    setPublishResult(null);
    const res = await publishPost({
      disableNotification: silent,
      pinMessage,
    });

    if (res.success) {
      setPublishResult({ success: true });
    } else {
      setPublishResult({ success: false, error: res.error });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/80 p-4 text-left backdrop-blur-sm animate-fade-in">
      <div role="dialog" aria-modal="true" aria-labelledby="publish-dialog-title" className="relative my-auto w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-slate-700/80 bg-[#17212b] p-5 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close publish dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 id="publish-dialog-title" className="text-base font-bold text-white">Publish to Telegram</h3>
            <p className="text-xs text-slate-400">Post rich message to your channel</p>
          </div>
        </div>

        {/* Selected Channel Pill */}
        <div className="p-3 rounded-2xl bg-[#0e1621] border border-slate-800 flex items-center justify-between my-4">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
              {activeChannel?.avatarUrl ? (
                <img src={activeChannel.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                activeChannel?.title?.charAt(0) || 'C'
              )}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{activeChannel?.title}</h4>
              <p className="text-[11px] text-slate-400">@{activeChannel?.username || activeChannel?.id}</p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Ready
          </span>
        </div>

        {/* Options */}
        <div className="space-y-2 mb-5">
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#121b24] border border-slate-800/80 cursor-pointer hover:bg-[#18232e] transition">
            <div className="flex items-center space-x-2.5 text-xs text-slate-200">
              <BellOff className="w-4 h-4 text-slate-400" />
              <span>Send Silently (No notification sound)</span>
            </div>
            <input
              type="checkbox"
              checked={silent}
              onChange={(e) => setSilent(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#121b24] border border-slate-800/80 cursor-pointer hover:bg-[#18232e] transition">
            <div className="flex items-center space-x-2.5 text-xs text-slate-200">
              <Pin className="w-4 h-4 text-slate-400" />
              <span>Pin Message to Channel</span>
            </div>
            <input
              type="checkbox"
              checked={pinMessage}
              onChange={(e) => setPinMessage(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700"
            />
          </label>
        </div>

        {/* Status Message */}
        {publishResult?.success && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Post successfully published to <b>{activeChannel?.title}</b>!</span>
          </div>
        )}

        {publishResult?.error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{publishResult.error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2">
          <button
            type="button"
              onClick={handleClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            {publishResult?.success ? 'Close' : 'Cancel'}
          </button>
          
          {publishResult?.success ? (
            <button
              type="button"
              onClick={() => {
                handleClose();
                setCurrentView('dashboard');
              }}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/25"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              type="button"
              disabled={isPublishing}
              onClick={handlePublish}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-sky-500/25 flex items-center space-x-2"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>POST NOW</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
