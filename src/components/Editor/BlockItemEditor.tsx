import React, { useState } from 'react';
import type { ContentBlock } from '../../types';
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  ExternalLink,
  MapPin
} from 'lucide-react';

interface Props {
  block: ContentBlock;
  onUpdate: (content: string, metadata?: ContentBlock['metadata']) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const BlockItemEditor: React.FC<Props> = ({
  block,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  const [newCollageUrl, setNewCollageUrl] = useState('');

  const renderEditorContent = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Level:</span>
              <div className="flex space-x-1">
                {([1, 2, 3] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onUpdate(block.content, { ...block.metadata, level: lvl })}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                      (block.metadata?.level || 1) === lvl
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    H{lvl}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="Enter heading title..."
              value={block.content}
              onChange={(e) => onUpdate(e.target.value, block.metadata)}
              className="w-full bg-[#0d141d] border border-slate-700/70 rounded-xl px-3.5 py-2 text-white font-bold placeholder-slate-500 focus:outline-none focus:border-sky-500 text-base"
            />
          </div>
        );

      case 'paragraph':
        return (
          <div className="space-y-1.5">
            <textarea
              rows={3}
              placeholder="Write your text here... Supports **bold**, _italic_, `code`, ||spoiler||"
              value={block.content}
              onChange={(e) => onUpdate(e.target.value, block.metadata)}
              className="w-full bg-[#0d141d] border border-slate-700/70 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition resize-y"
            />
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
              <span className="bg-slate-800/80 px-1.5 py-0.5 rounded">**bold**</span>
              <span className="bg-slate-800/80 px-1.5 py-0.5 rounded">_italic_</span>
              <span className="bg-slate-800/80 px-1.5 py-0.5 rounded">`code`</span>
              <span className="bg-slate-800/80 px-1.5 py-0.5 rounded">||spoiler||</span>
            </div>
          </div>
        );

      case 'quote':
      case 'pullquote':
        return (
          <div className="space-y-2">
            <textarea
              rows={2}
              placeholder="Enter quote or highlighted text..."
              value={block.content}
              onChange={(e) => onUpdate(e.target.value, block.metadata)}
              className="w-full bg-[#0d141d] border-l-4 border-sky-400 border-t border-r border-b border-slate-700/70 rounded-r-xl p-3 text-sm italic text-sky-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <input
              type="text"
              placeholder="Author / Source attribution (optional)"
              value={block.metadata?.author || ''}
              onChange={(e) => onUpdate(block.content, { ...block.metadata, author: e.target.value })}
              className="w-full bg-[#0d141d] border border-slate-700/70 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        );

      case 'fold':
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Spoiler Title / Label (e.g., Click to Reveal Promo Code)"
              value={block.metadata?.hiddenTitle || ''}
              onChange={(e) => onUpdate(block.content, { ...block.metadata, hiddenTitle: e.target.value })}
              className="w-full bg-[#0d141d] border border-slate-700/70 rounded-lg px-3 py-1.5 text-xs text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <textarea
              rows={2}
              placeholder="Hidden spoiler text or secrets..."
              value={block.content}
              onChange={(e) => onUpdate(e.target.value, block.metadata)}
              className="w-full bg-[#0d141d] border border-amber-500/30 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        );

      case 'photo':
      case 'video':
      case 'animation':
      case 'audio':
      case 'voice':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  block.type === 'photo'
                    ? 'Enter Image URL (e.g. https://...jpg)'
                    : block.type === 'video'
                    ? 'Enter Video URL (.mp4)'
                    : block.type === 'animation'
                    ? 'Enter GIF / Animation URL (.gif)'
                    : block.type === 'audio'
                    ? 'Enter Audio URL (.mp3, .m4a, etc.)'
                    : 'Enter Voice URL (.ogg, .mp3, etc.)'
                }
                value={block.metadata?.mediaUrl || ''}
                onChange={(e) => onUpdate(block.content, { ...block.metadata, mediaUrl: e.target.value })}
                className="w-full bg-[#0d141d] border border-slate-700/70 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                aria-label={`${block.type} media URL`}
              />
            </div>
            {block.metadata?.mediaUrl && (
              <div className="relative flex max-h-48 min-w-0 items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-black/40">
                {block.type === 'photo' ? (
                  <img
                    src={block.metadata.mediaUrl}
                    alt="Preview"
                    className="max-h-48 object-cover w-full"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : block.type === 'video' ? (
                  <video src={block.metadata.mediaUrl} controls preload="metadata" className="max-h-48 w-full bg-black object-contain" />
                ) : block.type === 'animation' ? (
                  <img src={block.metadata.mediaUrl} alt="Animation preview" className="max-h-48 w-full object-contain" />
                ) : block.type === 'audio' || block.type === 'voice' ? (
                  <audio src={block.metadata.mediaUrl} controls preload="metadata" className="m-3 w-11/12" />
                ) : (
                  <div className="flex min-w-0 gap-2 p-4 font-mono text-xs text-sky-400">
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    <span className="break-all">Media linked: {block.metadata.mediaUrl}</span>
                  </div>
                )}
              </div>
            )}
            <input
              type="text"
              placeholder="Caption for media (optional)..."
              value={block.content}
              onChange={(e) => onUpdate(e.target.value, block.metadata)}
              className="w-full bg-[#0d141d] border border-slate-700/70 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              aria-label="Media caption"
            />
          </div>
        );

      case 'collage':
      case 'slideshow':
        const urls = block.metadata?.mediaUrls || [];
        return (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Add up to 10 image URLs for album/collage:</p>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="https://...image.jpg"
                value={newCollageUrl}
                onChange={(e) => setNewCollageUrl(e.target.value)}
                className="flex-1 bg-[#0d141d] border border-slate-700/70 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono"
                aria-label="Image URL"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCollageUrl.trim() && urls.length < 10) {
                    onUpdate(block.content, {
                      ...block.metadata,
                      mediaUrls: [...urls, newCollageUrl.trim()]
                    });
                    setNewCollageUrl('');
                  }
                }}
                disabled={urls.length >= 10}
                className="flex items-center space-x-1 rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Collage Grid Thumbnails */}
            {urls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {urls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-900 aspect-video">
                    <img src={url} alt={`Collage ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = urls.filter((_, i) => i !== idx);
                        onUpdate(block.content, { ...block.metadata, mediaUrls: updated });
                      }}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 rounded text-white transition"
                      aria-label={`Remove collage image ${idx + 1}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="text"
              placeholder="Caption for this collection (optional)..."
              value={block.content}
              onChange={(e) => onUpdate(e.target.value, block.metadata)}
              className="w-full rounded-lg border border-slate-700/70 bg-[#0d141d] px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              aria-label="Collection caption"
            />
          </div>
        );

      case 'map': {
        const location = block.metadata?.mapLocation;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Location details</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={location?.latitude ?? ''}
                onChange={(e) => onUpdate(block.content, { ...block.metadata, mapLocation: { latitude: Number(e.target.value), longitude: location?.longitude ?? 0, address: location?.address } })}
                className="w-full rounded-xl border border-slate-700/70 bg-[#0d141d] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                aria-label="Map latitude"
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={location?.longitude ?? ''}
                onChange={(e) => onUpdate(block.content, { ...block.metadata, mapLocation: { latitude: location?.latitude ?? 0, longitude: Number(e.target.value), address: location?.address } })}
                className="w-full rounded-xl border border-slate-700/70 bg-[#0d141d] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                aria-label="Map longitude"
              />
            </div>
            <input
              type="text"
              placeholder="Place name or address (optional)"
              value={location?.address || ''}
              onChange={(e) => onUpdate(block.content, { ...block.metadata, mapLocation: { latitude: location?.latitude ?? 0, longitude: location?.longitude ?? 0, address: e.target.value } })}
              className="w-full rounded-xl border border-slate-700/70 bg-[#0d141d] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              aria-label="Map address"
            />
            <input
              type="text"
              placeholder="Location note (optional)"
              value={block.content}
              onChange={(e) => onUpdate(e.target.value, block.metadata)}
              className="w-full rounded-xl border border-slate-700/70 bg-[#0d141d] px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              aria-label="Map note"
            />
          </div>
        );
      }

      case 'list':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">List Style:</span>
              <button
                type="button"
                onClick={() => onUpdate(block.content, { ...block.metadata, style: 'bullet' })}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition ${
                  (block.metadata?.style || 'bullet') === 'bullet'
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                • Bullet
              </button>
              <button
                type="button"
                onClick={() => onUpdate(block.content, { ...block.metadata, style: 'number' })}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition ${
                  block.metadata?.style === 'number'
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                1. Numbered
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Item 1&#10;Item 2&#10;Item 3"
              value={block.content}
              onChange={(e) => onUpdate(e.target.value, block.metadata)}
              className="w-full bg-[#0d141d] border border-slate-700/70 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        );

      case 'code':
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Language (e.g., javascript, python, cpp)"
              value={block.metadata?.language || ''}
              onChange={(e) => onUpdate(block.content, { ...block.metadata, language: e.target.value })}
              className="w-36 bg-[#0d141d] border border-slate-700/70 rounded-lg px-2.5 py-1 text-xs text-sky-400 font-mono placeholder-slate-500"
            />
            <textarea
              rows={3}
              placeholder="// Write code snippet here..."
              value={block.content}
              onChange={(e) => onUpdate(e.target.value, block.metadata)}
              className="w-full bg-[#090e15] border border-slate-700/70 rounded-xl p-3 text-xs font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        );

      case 'table':
        return (
          <textarea
            rows={4}
            placeholder="Name | Value&#10;Example | 42"
            value={block.content}
            onChange={(e) => onUpdate(e.target.value, block.metadata)}
            className="w-full resize-y rounded-xl border border-slate-700/70 bg-[#090e15] p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
            aria-label="Table content"
          />
        );

      case 'math':
        return (
          <input
            type="text"
            placeholder="Enter a formula, e.g. E = mc²"
            value={block.content}
            onChange={(e) => onUpdate(e.target.value, block.metadata)}
            className="w-full rounded-xl border border-slate-700/70 bg-[#0d141d] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            aria-label="Math formula"
          />
        );

      case 'divider':
        return (
          <div className="py-2 flex items-center justify-center">
            <div className="w-full border-t border-slate-700/80"></div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            placeholder={`Enter ${block.type} text...`}
            value={block.content}
            onChange={(e) => onUpdate(e.target.value, block.metadata)}
            className="w-full bg-[#0d141d] border border-slate-700/70 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        );
    }
  };

  return (
    <div className="relative group bg-[#16202c] border border-slate-800 hover:border-slate-700/90 rounded-2xl p-4 transition shadow-md text-left">
      {/* Block Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-500/10 px-2 py-0.5 rounded-md">
            {block.type}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition"
            title="Move Up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition"
            title="Move Down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded text-slate-400 hover:text-rose-400 transition ml-1"
            title="Remove block"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Content */}
      {renderEditorContent()}
    </div>
  );
};
