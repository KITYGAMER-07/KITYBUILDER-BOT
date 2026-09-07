import React, { useState } from 'react';
import type { InlineButton, ButtonType } from '../../types';
import { Link2, Copy, Plus, X, AppWindow } from 'lucide-react';

interface Props {
  buttons: InlineButton[][];
  onAddButton: (button: Omit<InlineButton, 'id'>, rowIndex?: number) => void;
  onUpdateButton: (id: string, updated: Partial<InlineButton>) => void;
  onRemoveButton: (id: string) => void;
}

export const ButtonBuilderSection: React.FC<Props> = ({
  buttons,
  onAddButton,
  onUpdateButton,
  onRemoveButton,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<ButtonType>('link');
  const [btnTitle, setBtnTitle] = useState('');
  const [btnValue, setBtnValue] = useState('');

  const handleSaveNewButton = () => {
    if (!btnTitle.trim()) return;

    if (activeTab === 'link') {
      onAddButton({
        type: 'link',
        text: btnTitle.trim(),
        url: btnValue.trim().startsWith('http') ? btnValue.trim() : `https://${btnValue.trim()}`,
      });
    } else if (activeTab === 'copy') {
      onAddButton({
        type: 'copy',
        text: btnTitle.trim(),
        copyText: btnValue.trim(),
      });
    } else {
      onAddButton({
        type: 'webapp',
        text: btnTitle.trim(),
        webappUrl: btnValue.trim().startsWith('http') ? btnValue.trim() : `https://${btnValue.trim()}`,
      });
    }

    setBtnTitle('');
    setBtnValue('');
    setIsAdding(false);
  };

  const allButtons = buttons.flat();

  return (
    <div className="space-y-3 text-left">
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          INLINE BUTTONS
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">
          Add links, copy actions, or a Web App entry point below your message.
        </p>
      </div>

      {/* Existing Buttons List (Matching Screenshot 3) */}
      <div className="space-y-2.5">
        {allButtons.map((btn) => (
          <div
            key={btn.id}
            className="relative bg-[#141d26] border border-slate-800 rounded-2xl p-3.5 space-y-2.5 transition"
          >
            {/* Header: Type Badges & Delete */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateButton(btn.id, { type: 'link' })}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                    btn.type === 'link'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateButton(btn.id, { type: 'webapp' })}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                    btn.type === 'webapp'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <AppWindow className="w-3.5 h-3.5" />
                  <span>Web App</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateButton(btn.id, { type: 'copy' })}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                    btn.type === 'copy'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onRemoveButton(btn.id)}
                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                aria-label={`Remove ${btn.text || 'inline'} button`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Button title"
                value={btn.text}
                onChange={(e) => onUpdateButton(btn.id, { text: e.target.value })}
                className="w-full bg-[#0d141d] border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                aria-label="Button label"
              />
              <input
                type="text"
                placeholder={
                  btn.type === 'link'
                    ? 'https://...'
                    : btn.type === 'copy'
                    ? 'Text to copy to clipboard...'
                    : 'https://... (WebApp URL)'
                }
                value={btn.type === 'link' ? btn.url || '' : btn.type === 'copy' ? btn.copyText || '' : btn.webappUrl || ''}
                onChange={(e) => {
                  if (btn.type === 'link') onUpdateButton(btn.id, { url: e.target.value });
                  else if (btn.type === 'copy') onUpdateButton(btn.id, { copyText: e.target.value });
                  else onUpdateButton(btn.id, { webappUrl: e.target.value });
                }}
                className="w-full bg-[#0d141d] border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-sky-400 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                aria-label={btn.type === 'copy' ? 'Text to copy' : btn.type === 'webapp' ? 'Web App URL' : 'Link URL'}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Adding New Button Card */}
      {isAdding ? (
        <div className="bg-[#141d26] border border-sky-500/40 rounded-2xl p-3.5 space-y-3 shadow-lg animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('link')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                  activeTab === 'link'
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Link</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('webapp')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                  activeTab === 'webapp'
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <AppWindow className="w-3.5 h-3.5" />
                <span>Web App</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('copy')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                  activeTab === 'copy'
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1 text-slate-400 hover:text-white"
              aria-label="Cancel adding an inline button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Button title (e.g. Join Channel / Get Promo)"
              value={btnTitle}
              onChange={(e) => setBtnTitle(e.target.value)}
              className="w-full bg-[#0d141d] border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              aria-label="Button label"
            />
            <input
              type="text"
              placeholder={activeTab === 'link' || activeTab === 'webapp' ? 'https://...' : 'Text / Coupon code to copy...'}
              value={btnValue}
              onChange={(e) => setBtnValue(e.target.value)}
              className="w-full bg-[#0d141d] border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-sky-400 placeholder-slate-600 focus:outline-none focus:border-sky-500"
              aria-label={activeTab === 'copy' ? 'Text to copy' : activeTab === 'webapp' ? 'Web App URL' : 'Link URL'}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNewButton}
              disabled={!btnTitle.trim() || !btnValue.trim()}
              className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition"
            >
              Add
            </button>
          </div>
        </div>
      ) : (
        /* + Add button dashed button (Matching Screenshot 2 & 3) */
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full py-3.5 px-4 rounded-2xl border border-dashed border-sky-500/40 hover:border-sky-400 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 hover:text-sky-300 font-bold text-xs flex items-center justify-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add button</span>
        </button>
      )}
    </div>
  );
};
