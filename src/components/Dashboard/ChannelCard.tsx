import React from 'react';
import type { TelegramChannel } from '../../types';
import { CheckCircle2, ChevronRight, Users, Trash2 } from 'lucide-react';

interface Props {
  channel: TelegramChannel;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export const ChannelCard: React.FC<Props> = ({
  channel,
  isSelected,
  onSelect,
  onDelete,
}) => {
  return (
    <div
      className={`group relative flex items-center justify-between gap-2 rounded-2xl border p-3.5 transition-all duration-200 ${
        isSelected
          ? 'bg-slate-800/90 border-sky-500 shadow-md shadow-sky-500/10'
          : 'bg-[#18222d] border-slate-800/80 hover:bg-[#1f2b38] hover:border-slate-700'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3.5 overflow-hidden text-left"
        aria-label={`Select ${channel.title}`}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-inner overflow-hidden">
            {channel.avatarUrl ? (
              <img
                src={channel.avatarUrl}
                alt={channel.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span>{channel.title.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {channel.verified && (
            <div className="absolute -bottom-0.5 -right-0.5 bg-sky-500 rounded-full p-0.5 text-white shadow">
              <CheckCircle2 className="w-3.5 h-3.5 fill-sky-500 text-white" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="text-left overflow-hidden">
          <div className="flex items-center space-x-1.5">
            <h4 className="font-bold text-white text-sm truncate max-w-[200px]">
              {channel.title}
            </h4>
            {channel.verified && (
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
            <span>@{channel.username || channel.id.replace('@', '')}</span>
            <span>•</span>
            <div className="flex items-center space-x-1 text-slate-300">
              <Users className="w-3 h-3 text-slate-400" />
              <span>
                {channel.memberCount
                  ? channel.memberCount >= 1000
                    ? `${(channel.memberCount / 1000).toFixed(1)}k`
                    : channel.memberCount
                  : '2.9k'}{' '}
                subscribers
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Right Controls */}
      <div className="flex shrink-0 items-center gap-1">
        {onDelete && (
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400 sm:opacity-0 sm:group-hover:opacity-100"
            title="Remove channel"
            aria-label={`Remove ${channel.title}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onSelect}
          className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-700/70 hover:text-slate-300"
          aria-label={`Open ${channel.title}`}
        >
          <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
