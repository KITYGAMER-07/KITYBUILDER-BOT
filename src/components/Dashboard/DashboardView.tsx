import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChannelCard } from './ChannelCard';
import { AddChannelModal } from './AddChannelModal';
import { BrandBotModal } from '../BotSettingsModal';
import { Plus, Video, FileText, Clock, Zap, Radio, Bot, Eye } from 'lucide-react';

interface Props {
  onOpenRoundVideo: () => void;
}

export const DashboardView: React.FC<Props> = ({ onOpenRoundVideo }) => {
  const {
    channels,
    activeChannel,
    setActiveChannel,
    deleteChannel,
    startNewPost,
    drafts,
    loadDraft,
    deleteDraft,
    language
  } = useApp();

  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [isManagingChannels, setIsManagingChannels] = useState(false);
  const [isBrandBotGuideOpen, setIsBrandBotGuideOpen] = useState(false);

  const lastDraft = drafts.length > 0 ? drafts[0] : null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-3 py-4 animate-fade-in sm:space-y-6 sm:px-4 sm:py-6">
      {/* App Intro */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 p-5 shadow-2xl shadow-sky-950/40 sm:p-6">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-44 h-44 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-start text-left">
          <div className="mb-2.5 flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-300">
            <Zap className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
            <span>KITYBUILDER PRO</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Create Stunning Posts For Telegram
          </h2>
          <p className="text-xs text-sky-200/80 mt-1.5 max-w-sm">
            Format headers, spoilers, photo collages, and interactive inline buttons with 1-click publishing.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-sky-200/90">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span>Rich formatting</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
              <span>Live preview</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
              <span>Media-ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-3">
        {/* + New Message Button */}
        <button
          onClick={startNewPost}
          className="w-full flex items-center justify-center space-x-2.5 py-3.5 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 active:scale-[0.99] text-white font-bold text-base shadow-xl shadow-sky-500/25 transition duration-150"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>{language === 'en' ? 'New Message' : 'புதிய மெசேஜ் உருவாக்க'}</span>
        </button>

        {/* Round Video Button */}
        <button
          onClick={onOpenRoundVideo}
          className="w-full flex items-center justify-center space-x-2.5 py-3.5 px-6 rounded-2xl bg-[#18222d] hover:bg-[#202c3a] border border-slate-700/80 active:scale-[0.99] text-white font-bold text-sm shadow-md transition duration-150"
        >
          <Video className="w-4 h-4 text-sky-400" />
          <span>{language === 'en' ? 'Round Video' : 'ரவுண்ட் வீடியோ (Video Note)'}</span>
        </button>
      </div>

      {/* YOUR CHANNELS Section */}
      <div className="space-y-3 text-left">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {language === 'en' ? 'YOUR CHANNELS' : 'உங்கள் சேனல்கள்'}
          </h3>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsBrandBotGuideOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/70 text-sky-400 transition hover:bg-slate-700 hover:text-sky-300"
              title="Brand bot guide"
              aria-label="Open brand bot guide"
            >
              <Bot className="h-4 w-4" />
            </button>
            {channels.length > 0 && (
              <button
                onClick={() => setIsManagingChannels(!isManagingChannels)}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
              >
                {isManagingChannels ? 'Done' : 'Manage >'}
              </button>
            )}
            <button
              onClick={() => setIsAddChannelOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 transition hover:bg-sky-500/20"
              title="Add Channel"
              aria-label="Add channel"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Channels List */}
        <div className="space-y-2.5">
          {channels.length === 0 ? (
            <button
              type="button"
              onClick={() => setIsAddChannelOpen(true)}
              className="group w-full space-y-2 rounded-2xl border border-dashed border-slate-700/80 bg-[#141d26] p-6 text-center transition hover:border-sky-500/50"
            >
              <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                <Radio className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-300 font-medium">No channels connected yet.</p>
              <p className="text-[11px] text-slate-500">Add your Telegram channel to start posting rich messages.</p>
              <span className="inline-flex items-center space-x-1.5 pt-1 text-xs font-bold text-sky-400 group-hover:text-sky-300">
                <Plus className="w-3.5 h-3.5" />
                <span>Connect Channel</span>
              </span>
            </button>
          ) : (
            channels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                isSelected={activeChannel?.id === channel.id}
                onSelect={() => {
                  setActiveChannel(channel);
                  startNewPost();
                }}
                onDelete={
                  isManagingChannels
                    ? (e) => {
                        e.stopPropagation();
                        deleteChannel(channel.id);
                      }
                    : undefined
                }
              />
            ))
          )}
        </div>
      </div>

      {/* LAST DRAFT Section (Matching Screenshot 4/5) */}
      <div className="space-y-3 text-left">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {language === 'en' ? 'LAST DRAFT' : 'கடைசி வரைவு (Draft)'}
          </h3>
          {lastDraft && (
            <span className="text-[11px] text-slate-500 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(lastDraft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          )}
        </div>

        {lastDraft ? (
          <div className="group relative flex items-center gap-2 rounded-2xl border border-slate-800/90 bg-[#18222d] p-4 shadow-md transition hover:border-slate-700 hover:bg-[#1f2b38]">
              <button
                type="button"
                onClick={() => loadDraft(lastDraft)}
                className="flex min-w-0 flex-1 items-center space-x-3 overflow-hidden text-left"
                aria-label={`Open draft ${lastDraft.title || 'Untitled Post'}`}
              >
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="font-semibold text-white text-sm truncate max-w-[220px]">
                    {lastDraft.title || 'Untitled Post'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {lastDraft.blocks?.length || 0} blocks • {lastDraft.buttons?.flat().length || 0} buttons
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => deleteDraft(lastDraft.id)}
                className="rounded-lg p-1.5 text-slate-500 transition hover:text-rose-400 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label={`Delete draft ${lastDraft.title || 'Untitled Post'}`}
              >
                Delete
              </button>
          </div>
        ) : (
          <div className="p-7 rounded-2xl bg-[#141d26] border border-slate-800/80 text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400">
              <Zap className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
              <span>No drafts yet. Start writing.</span>
            </p>
          </div>
        )}
      </div>

      <AddChannelModal
        isOpen={isAddChannelOpen}
        onClose={() => setIsAddChannelOpen(false)}
      />

      <BrandBotModal
        isOpen={isBrandBotGuideOpen}
        onClose={() => setIsBrandBotGuideOpen(false)}
      />
    </div>
  );
};
