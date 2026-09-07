import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BlockItemEditor } from './BlockItemEditor';
import { AddBlockSheet } from './AddBlockSheet';
import { ButtonBuilderSection } from './ButtonBuilderModal';
import { TelegramPreview } from '../Preview/TelegramPreview';
import { PublishModal } from '../PublishModal';
import {
  ChevronLeft,
  ChevronDown,
  Plus,
  Send,
  Hourglass,
  Eye,
  Edit3,
  Check
} from 'lucide-react';

export const EditorView: React.FC = () => {
  const {
    channels,
    activeChannel,
    setActiveChannel,
    setCurrentView,
    editorTab,
    setEditorTab,
    blocks,
    buttons,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    addButton,
    updateButton,
    removeButton,
    saveCurrentDraft,
  } = useApp();

  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const previousBlockCount = useRef(blocks.length);
  const newestBlockAnchor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (blocks.length > previousBlockCount.current) {
      window.setTimeout(() => {
        newestBlockAnchor.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 180);
    }
    previousBlockCount.current = blocks.length;
  }, [blocks.length]);

  const handleSaveDraft = async () => {
    await saveCurrentDraft();
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2500);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-3 py-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] text-left animate-fade-in sm:px-4 sm:pb-28">
      {/* Top Header Bar */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 sm:flex sm:justify-between">
        {/* Back Arrow Button */}
        <button
          onClick={() => setCurrentView('dashboard')}
          className="shrink-0 rounded-xl border border-slate-800 bg-[#17212b] p-2 text-slate-300 transition hover:bg-[#202c3a] hover:text-white"
          title="Back to Dashboard"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Channel Selector Pill */}
        <div className="relative min-w-0">
          <button
            onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
            className="flex w-full min-w-0 items-center gap-2 rounded-full border border-[#2c3d52] bg-[#182533] px-3 py-2 text-xs font-bold text-white transition hover:border-sky-500/50 sm:max-w-[260px] sm:py-1.5"
            aria-expanded={isChannelDropdownOpen}
            aria-haspopup="listbox"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-[10px] shrink-0 overflow-hidden">
              {activeChannel?.avatarUrl ? (
                <img src={activeChannel.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                activeChannel?.title?.charAt(0) || 'C'
              )}
            </div>
            <span className="truncate">{activeChannel?.title || 'Select Channel'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {isChannelDropdownOpen && (
            <div className="absolute left-0 top-full z-30 mt-1.5 w-60 max-w-[calc(100vw-1.5rem)] space-y-1 rounded-2xl border border-slate-700 bg-[#17212b] p-1.5 shadow-2xl" role="listbox" aria-label="Select a channel">
              {channels.length === 0 ? (
                <div className="px-3 py-3 text-xs text-slate-400">No channels connected yet. Add one from the dashboard.</div>
              ) : channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChannel(ch);
                    setIsChannelDropdownOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold transition ${
                    activeChannel?.id === ch.id
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-[10px] text-white shrink-0 overflow-hidden">
                    {ch.avatarUrl ? (
                      <img src={ch.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      ch.title.charAt(0)
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate text-white">{ch.title}</p>
                    <p className="text-[10px] text-slate-400">@{ch.username || ch.id}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Segmented Tab: Write | Preview */}
        <div className="col-span-2 grid grid-cols-2 gap-1 rounded-full border border-slate-800 bg-[#101923] p-1 sm:col-span-1 sm:flex sm:w-auto">
          <button
            onClick={() => setEditorTab('write')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition sm:flex-none sm:py-1.5 ${
              editorTab === 'write'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            onClick={() => setEditorTab('preview')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition sm:flex-none sm:py-1.5 ${
              editorTab === 'preview'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-[#121b25] px-3.5 py-2 text-[11px] text-slate-400">
        <Hourglass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Save a draft anytime and return to your work later.</span>
      </div>

      {/* MAIN VIEW: Write OR Preview */}
      {editorTab === 'write' ? (
        <div className="space-y-4">
          {/* Canvas Area */}
          {blocks.length === 0 ? (
            /* Empty Canvas placeholder matching Screenshot 2 */
            <button
              type="button"
              onClick={() => setIsAddBlockOpen(true)}
              className="group w-full cursor-pointer rounded-2xl border-2 border-dashed border-slate-800 bg-[#121a24]/50 px-6 py-12 text-center transition hover:border-sky-500/50 hover:bg-[#15202d]"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition">
                <Plus className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-400 group-hover:text-slate-200">
                Canvas is empty — tap <b className="text-sky-400">+ Add Block</b> to start.
              </p>
            </button>
          ) : (
            /* Blocks List */
            <div className="space-y-3">
              {blocks.map((block, idx) => (
                <React.Fragment key={block.id}>
                  <BlockItemEditor
                    block={block}
                    onUpdate={(content, metadata) => updateBlock(block.id, content, metadata)}
                    onRemove={() => removeBlock(block.id)}
                    onMoveUp={() => moveBlock(block.id, 'up')}
                    onMoveDown={() => moveBlock(block.id, 'down')}
                    isFirst={idx === 0}
                    isLast={idx === blocks.length - 1}
                  />
                  {idx === blocks.length - 1 && <div ref={newestBlockAnchor} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Inline Buttons Builder Section */}
          <ButtonBuilderSection
            buttons={buttons}
            onAddButton={addButton}
            onUpdateButton={updateButton}
            onRemoveButton={removeButton}
          />

          {/* Action Button: + Add Block */}
          <div className="pt-2">
            <button
              onClick={() => setIsAddBlockOpen(true)}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl bg-[#18232f] hover:bg-[#202e3e] border border-slate-700/80 active:scale-[0.99] text-sky-400 font-bold text-sm shadow-md transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Block</span>
            </button>
          </div>

          {/* Save Draft Action */}
          <div className="text-center pt-1">
            <button
              onClick={handleSaveDraft}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 py-1.5 px-4 rounded-lg hover:bg-slate-800 transition"
            >
              {draftSavedToast ? (
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Draft saved
                </span>
              ) : 'Save Draft'}
            </button>
          </div>
        </div>
      ) : (
        /* Preview Tab */
        <div className="space-y-4">
          <TelegramPreview />
        </div>
      )}

      {/* Sticky publish action */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/90 bg-[#0b131e]/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_rgba(2,8,23,0.45)] backdrop-blur sm:px-4">
        <button
          onClick={() => setIsPublishModalOpen(true)}
          disabled={blocks.length === 0 || !activeChannel}
          title={!activeChannel ? 'Select a channel before publishing' : undefined}
          className="mx-auto flex w-full max-w-2xl items-center justify-center gap-2 rounded-2xl bg-[#0088cc] px-6 py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-xl shadow-sky-500/25 transition hover:bg-[#0077b5] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Publish</span>
        </button>
      </div>

      {/* Add Block Bottom Sheet Modal */}
      <AddBlockSheet
        isOpen={isAddBlockOpen}
        onClose={() => setIsAddBlockOpen(false)}
        onSelectBlock={(type) => addBlock(type)}
      />

      {/* Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />
    </div>
  );
};
