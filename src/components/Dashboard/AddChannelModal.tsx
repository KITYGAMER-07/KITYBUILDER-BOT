import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldAlert, Loader2, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddChannelModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addChannel, botInfo } = useApp();
  const [channelInput, setChannelInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const brandBotHandle = botInfo?.username ? `@${botInfo.username}` : 'the KITYBUILDER brand bot';

  const handleClose = () => {
    setChannelInput('');
    setErrorMsg('');
    onClose();
  };

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelInput.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await addChannel(channelInput.trim());
      if (res.success) {
        handleClose();
      } else {
        setErrorMsg(
          res.error ||
          `Make sure ${brandBotHandle} is added as an Administrator with "Post Messages" permission!`
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting channel');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/80 p-4 text-left backdrop-blur-sm animate-fade-in">
      <div role="dialog" aria-modal="true" aria-labelledby="channel-dialog-title" className="relative my-auto w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-slate-700/80 bg-[#17212b] p-5 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close channel dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 id="channel-dialog-title" className="text-base font-bold text-white mb-1">
          Connect Telegram Channel
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Add your channel to start publishing rich formatted messages.
        </p>

        {/* Step-by-Step Instructions */}
        <div className="bg-[#0e1621] p-3.5 rounded-2xl border border-slate-800 mb-4 space-y-2.5 text-xs text-slate-300">
          <div className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
              1
            </span>
            <span>
              Open your Telegram Channel settings and go to <b>Administrators</b>.
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
              2
            </span>
            <span>
              Add <b>{brandBotHandle}</b> as an Administrator with <i>Post Messages</i> permission enabled.
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
              3
            </span>
            <span>
              Type your channel's <b>@username</b> or Channel ID below and tap Connect.
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleConnect} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Channel Username or ID
            </label>
            <input
              type="text"
              placeholder="@your_channel_name or -100xxxxxxxx"
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              className="w-full bg-[#0e1621] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !channelInput.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-50 flex items-center space-x-2 transition shadow-lg shadow-sky-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Admin...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Connect Channel</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
