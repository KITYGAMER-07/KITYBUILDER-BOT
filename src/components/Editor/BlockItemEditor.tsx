import React, { useState } from 'react';
import type { ContentBlock } from '../../types';
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  MapPin
} from 'lucide-react';
import { LocalMediaThumbnail, MediaUploadCard } from './MediaUploadCard';
import { brandBotRequest } from '../../services/api';

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
              <div className="flex flex-wrap gap-1">
                {([1, 2, 3, 4, 5, 6] as const).map((lvl) => (
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
            <button
              type="button"
              onClick={() => onUpdate(block.content, { ...block.metadata, foldOpen: !(block.metadata?.foldOpen ?? false) })}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${block.metadata?.foldOpen ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-200 hover:bg-slate-700'}`}
              aria-pressed={block.metadata?.foldOpen ?? false}
            >
              {block.metadata?.foldOpen ? '▲ Close preview' : '▼ Open preview'}
            </button>
          </div>
        );

      case 'photo':
      case 'video':
      case 'animation':
      case 'audio':
      case 'voice':
        return (
          <div className="space-y-3">
            <MediaUploadCard
              type={block.type}
              localMediaId={block.metadata?.localMediaId}
              onUploaded={(localMediaId) => onUpdate(block.content, { ...block.metadata, localMediaId, mediaUrl: undefined })}
              onRemove={() => onUpdate(block.content, { ...block.metadata, localMediaId: undefined })}
            />
            {(block.type === 'photo' || block.type === 'video' || block.type === 'animation') && (
              <button
                type="button"
                role="switch"
                aria-checked={block.metadata?.mediaSpoiler ?? false}
                onClick={() => onUpdate(block.content, { ...block.metadata, mediaSpoiler: !(block.metadata?.mediaSpoiler ?? false) })}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition ${block.metadata?.mediaSpoiler ? 'border-amber-400/50 bg-amber-500/10 text-amber-200' : 'border-slate-700/70 bg-slate-900 text-slate-300'}`}
              >
                <span>Hide media with Telegram spoiler</span>
                <span className={`relative h-5 w-9 rounded-full transition ${block.metadata?.mediaSpoiler ? 'bg-amber-400' : 'bg-slate-600'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${block.metadata?.mediaSpoiler ? 'left-[1.125rem]' : 'left-0.5'}`} /></span>
              </button>
            )}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 before:h-px before:flex-1 before:bg-slate-800 after:h-px after:flex-1 after:bg-slate-800">or use a public link</div>
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
                onChange={(e) => onUpdate(block.content, { ...block.metadata, mediaUrl: e.target.value, localMediaId: undefined })}
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
                ) : null}
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
        const localMediaIds = block.metadata?.localMediaIds || [];
        const totalMediaItems = urls.length + localMediaIds.length;
        return (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Add up to 10 images. Files go directly to Telegram only when you publish.</p>
            <div className="grid grid-cols-3 gap-2">
              {localMediaIds.map((localMediaId, index) => (
                <LocalMediaThumbnail
                  key={localMediaId}
                  localMediaId={localMediaId}
                  onRemove={() => onUpdate(block.content, { ...block.metadata, localMediaIds: localMediaIds.filter((_, itemIndex) => itemIndex !== index) })}
                />
              ))}
              {urls.map((url, idx) => (
                <div key={url} className="relative group aspect-video overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
                  <img src={url} alt={`Collection ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onUpdate(block.content, { ...block.metadata, mediaUrls: urls.filter((_, itemIndex) => itemIndex !== idx) })}
                    className="absolute right-1 top-1 rounded bg-black/70 p-1 text-white transition hover:bg-rose-600"
                    aria-label={`Remove collection image ${idx + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {totalMediaItems < 10 && (
                <MediaUploadCard
                  type="photo"
                  compact
                  onUploaded={(localMediaId) => onUpdate(block.content, { ...block.metadata, localMediaIds: [...localMediaIds, localMediaId] })}
                />
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 before:h-px before:flex-1 before:bg-slate-800 after:h-px after:flex-1 after:bg-slate-800">or add an image link</div>
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
                  if (newCollageUrl.trim() && totalMediaItems < 10) {
                    onUpdate(block.content, {
                      ...block.metadata,
                      mediaUrls: [...urls, newCollageUrl.trim()]
                    });
                    setNewCollageUrl('');
                  }
                }}
                disabled={totalMediaItems >= 10}
                className="flex items-center space-x-1 rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

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

      case 'map':
        return <MapLocationEditor block={block} onUpdate={onUpdate} />;

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
            <select
              value={block.metadata?.language || 'javascript'}
              onChange={(e) => onUpdate(block.content, { ...block.metadata, language: e.target.value })}
              className="w-full max-w-48 bg-[#0d141d] border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs text-sky-400 font-mono focus:outline-none focus:border-sky-500"
              aria-label="Code language"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="bash">Bash</option>
              <option value="text">Plain text</option>
            </select>
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
        return <TableEditor block={block} onUpdate={onUpdate} />;

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

const getTableData = (block: ContentBlock): string[][] => {
  if (Array.isArray(block.metadata?.tableData) && block.metadata.tableData.length > 0) {
    return block.metadata.tableData.map((row) => Array.isArray(row) ? row.map((cell) => String(cell ?? '')) : ['']);
  }

  const imported = (block.content || '')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((row) => row.split('|').map((cell) => cell.trim()));
  return imported.length > 0 ? imported : [['', ''], ['', '']];
};

const TableEditor: React.FC<Pick<Props, 'block' | 'onUpdate'>> = ({ block, onUpdate }) => {
  const tableData = getTableData(block);
  const columnCount = Math.max(1, ...tableData.map((row) => row.length));
  const normalized = tableData.map((row) => [...row, ...Array(Math.max(0, columnCount - row.length)).fill('')]);

  const save = (nextRows: string[][], tableHasHeader = block.metadata?.tableHasHeader ?? true) => {
    const nextContent = nextRows.map((row) => row.join(' | ')).join('\n');
    onUpdate(nextContent, { ...block.metadata, tableData: nextRows, tableHasHeader });
  };

  const updateCell = (rowIndex: number, columnIndex: number, value: string) => {
    const next = normalized.map((row) => [...row]);
    next[rowIndex][columnIndex] = value;
    save(next);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-slate-700/70 bg-[#0d141d] p-2">
        <div className="grid min-w-[26rem] gap-1" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(7rem, 1fr))` }}>
          {normalized.flatMap((row, rowIndex) => row.map((cell, columnIndex) => (
            <input
              key={`${rowIndex}-${columnIndex}`}
              type="text"
              value={cell}
              placeholder={rowIndex === 0 && (block.metadata?.tableHasHeader ?? true) ? `Header ${columnIndex + 1}` : 'Cell value'}
              onChange={(event) => updateCell(rowIndex, columnIndex, event.target.value)}
              className={`min-w-0 rounded-lg border px-2.5 py-2 text-xs outline-none transition ${
                rowIndex === 0 && (block.metadata?.tableHasHeader ?? true)
                  ? 'border-sky-500/30 bg-sky-500/10 font-semibold text-sky-100 focus:border-sky-400'
                  : 'border-slate-700/70 bg-slate-900 text-slate-200 focus:border-sky-500'
              }`}
              aria-label={`Table row ${rowIndex + 1}, column ${columnIndex + 1}`}
            />
          )))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => save([...normalized, Array(columnCount).fill('')])} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700">+ Row</button>
        <button type="button" disabled={normalized.length <= 1} onClick={() => save(normalized.slice(0, -1))} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-40">− Row</button>
        <button type="button" onClick={() => save(normalized.map((row) => [...row, '']))} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700">+ Column</button>
        <button type="button" disabled={columnCount <= 1} onClick={() => save(normalized.map((row) => row.slice(0, -1)))} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-40">− Column</button>
        <button
          type="button"
          onClick={() => save(normalized, !(block.metadata?.tableHasHeader ?? true))}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${(block.metadata?.tableHasHeader ?? true) ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          Header row
        </button>
      </div>
      <p className="text-[11px] text-slate-500">Swipe the grid sideways on mobile when your table has many columns.</p>
    </div>
  );
};

type PlaceResult = { latitude: number; longitude: number; label: string };

const MapLocationEditor: React.FC<Pick<Props, 'block' | 'onUpdate'>> = ({ block, onUpdate }) => {
  const location = block.metadata?.mapLocation;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const delta = 0.035;
  const mapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(longitude! - delta).toFixed(5)}%2C${(latitude! - delta).toFixed(5)}%2C${(longitude! + delta).toFixed(5)}%2C${(latitude! + delta).toFixed(5)}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : null;

  const updateLocation = (next: Partial<{ latitude: number; longitude: number; address?: string }>) => {
    onUpdate(block.content, {
      ...block.metadata,
      mapLocation: {
        latitude: next.latitude ?? latitude ?? 0,
        longitude: next.longitude ?? longitude ?? 0,
        address: next.address ?? location?.address,
      },
    });
  };

  const search = async () => {
    if (query.trim().length < 2) {
      setStatus('Enter at least 2 characters to search.');
      return;
    }
    setStatus('Searching places…');
    try {
      const response = await brandBotRequest(`/api/places?q=${encodeURIComponent(query.trim())}`) as { places?: PlaceResult[] };
      setResults(response.places || []);
      setStatus(response.places?.length ? 'Choose a location below.' : 'No matching location found. Try another search.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Location search is unavailable.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Location details</span>
      </div>
      {mapUrl ? (
        <div className="overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900">
          <iframe title="Selected location map" src={mapUrl} className="h-40 w-full border-0" loading="lazy" />
          <p className="px-2 py-1 text-[10px] text-slate-500">© OpenStreetMap contributors</p>
        </div>
      ) : (
        <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/60 text-xs text-slate-500">Search a city or enter coordinates to show the map.</div>
      )}
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') void search(); }}
          placeholder="Search city / place…"
          className="min-w-0 flex-1 rounded-xl border border-slate-700/70 bg-[#0d141d] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          aria-label="Search city or place"
        />
        <button type="button" onClick={() => void search()} className="rounded-xl bg-sky-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-sky-400">Search</button>
      </div>
      {status && <p className="text-[11px] text-slate-400">{status}</p>}
      {results.length > 0 && (
        <div className="max-h-32 space-y-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          {results.map((place) => (
            <button
              type="button"
              key={`${place.latitude}-${place.longitude}-${place.label}`}
              onClick={() => {
                updateLocation(place);
                setResults([]);
                setStatus('Location selected.');
              }}
              className="w-full rounded-lg px-2.5 py-2 text-left text-xs text-slate-300 transition hover:bg-sky-500/10 hover:text-sky-200"
            >
              {place.label}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input type="number" step="any" placeholder="Latitude" value={latitude ?? ''} onChange={(event) => updateLocation({ latitude: Number(event.target.value) })} className="w-full rounded-xl border border-slate-700/70 bg-[#0d141d] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none" aria-label="Map latitude" />
        <input type="number" step="any" placeholder="Longitude" value={longitude ?? ''} onChange={(event) => updateLocation({ longitude: Number(event.target.value) })} className="w-full rounded-xl border border-slate-700/70 bg-[#0d141d] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none" aria-label="Map longitude" />
      </div>
      <input type="text" placeholder="Place name or address (optional)" value={location?.address || ''} onChange={(event) => updateLocation({ address: event.target.value })} className="w-full rounded-xl border border-slate-700/70 bg-[#0d141d] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none" aria-label="Map address" />
      <input type="text" placeholder="Location note (optional)" value={block.content} onChange={(event) => onUpdate(event.target.value, block.metadata)} className="w-full rounded-xl border border-slate-700/70 bg-[#0d141d] px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:border-sky-500 focus:outline-none" aria-label="Map note" />
    </div>
  );
};
