import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Video } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RoundVideoModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addBlock, setCurrentView, setEditorTab } = useApp();
  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');

  const handleClose = () => {
    setVideoUrl('');
    setCaption('');
    onClose();
  };

  if (!isOpen) return null;

  const handleCreateRoundVideo = () => {
    if (!videoUrl.trim()) return;

    // Add round video block
    addBlock('animation', caption.trim(), {
      mediaUrl: videoUrl.trim(),
      mediaKind: 'roundVideo',
    });

    handleClose();
    setCurrentView('editor');
    setEditorTab('write');
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div role="dialog" aria-modal="true" aria-labelledby="round-video-title" className="relative my-auto w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-slate-700 bg-[#17212b] p-5 text-left shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close round video dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 id="round-video-title" className="text-base font-bold text-white">Round Video Note</h3>
            <p className="text-xs text-slate-400">Telegram Telescope Circular Video Message</p>
          </div>
        </div>

        {/* Circular Preview Container */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="w-36 h-36 rounded-full border-4 border-sky-400/80 bg-slate-900 overflow-hidden shadow-xl shadow-sky-500/20 flex items-center justify-center relative group">
            {videoUrl ? (
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-3 text-slate-500">
                <Video className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <span className="text-[10px]">Circle Preview</span>
              </div>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Video URL (.mp4 or direct link)
            </label>
            <input
              type="text"
              placeholder="https://.../video.mp4"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full bg-[#0e1621] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Accompanying Caption / Title
            </label>
            <input
              type="text"
              placeholder="Optional message caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-[#0e1621] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!videoUrl.trim()}
            onClick={handleCreateRoundVideo}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition"
          >
            Insert into Canvas
          </button>
        </div>
      </div>
    </div>
  );
};
