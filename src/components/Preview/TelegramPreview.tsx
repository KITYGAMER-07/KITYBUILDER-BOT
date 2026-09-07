import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { parseInlineToHtml } from '../../utils/telegramParser';
import {
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  CheckCheck,
  AppWindow,
  LockKeyhole,
  Music2,
  Mic,
  MapPin,
  Sigma
} from 'lucide-react';
import { getLocalMedia } from '../../services/localMedia';

const DeviceMediaPreview: React.FC<{ localMediaId: string; type: 'photo' | 'video' | 'animation' | 'audio' | 'voice'; caption?: string; spoiler?: boolean; onReveal?: () => void }> = ({ localMediaId, type, caption, spoiler = false, onReveal }) => {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    void getLocalMedia(localMediaId).then((selectedFile) => {
      if (!active || !selectedFile) return;
      objectUrl = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setSource(objectUrl);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [localMediaId]);

  if (!file || !source) {
    return <div className="rounded-xl border border-dashed border-slate-600 bg-slate-900/60 p-3 text-xs text-slate-400">Selected file is ready to publish.</div>;
  }

  const wrapSpoiler = (media: React.ReactNode) => spoiler ? (
    <div className="relative overflow-hidden rounded-xl">
      <div className="pointer-events-none select-none blur-xl brightness-75">{media}</div>
      <button type="button" onClick={onReveal} className="absolute inset-0 flex items-center justify-center bg-slate-950/30 text-xs font-bold text-white" aria-label="Reveal spoiler media">Tap to reveal spoiler</button>
    </div>
  ) : media;

  if (type === 'photo' || (type === 'animation' && file.type.startsWith('image/'))) {
    return wrapSpoiler(<figure className="overflow-hidden rounded-xl border border-slate-700/70 bg-black/30"><img src={source} alt={caption || 'Selected media'} className="max-h-80 w-full object-cover" />{caption && <figcaption className="px-3 py-2 text-xs text-slate-200">{caption}</figcaption>}</figure>);
  }
  if (type === 'video' || type === 'animation') {
    return wrapSpoiler(<figure className="overflow-hidden rounded-xl border border-slate-700/70 bg-black/30"><video src={source} controls playsInline preload="metadata" className="max-h-80 w-full bg-black object-contain" />{caption && <figcaption className="px-3 py-2 text-xs text-slate-200">{caption}</figcaption>}</figure>);
  }
  const AudioIcon = type === 'voice' ? Mic : Music2;
  return <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-sky-300"><AudioIcon className="h-4 w-4" /><span>{type === 'voice' ? 'Voice message' : file.name}</span></div><audio src={source} controls className="h-9 w-full" />{caption && <p className="mt-2 text-xs text-slate-200">{caption}</p>}</div>;
};

export const TelegramPreview: React.FC = () => {
  const { blocks, buttons, activeChannel } = useApp();
  const [copyState, setCopyState] = useState<{ id: string; success: boolean } | null>(null);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  const handleCopyClick = async (btnId: string, copyText?: string) => {
    if (!copyText) return;

    let copied = false;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API is unavailable');
      await navigator.clipboard.writeText(copyText);
      copied = true;
    } catch {
      const fallbackInput = document.createElement('textarea');
      fallbackInput.value = copyText;
      fallbackInput.style.position = 'fixed';
      fallbackInput.style.opacity = '0';
      document.body.appendChild(fallbackInput);
      fallbackInput.select();
      copied = document.execCommand('copy');
      document.body.removeChild(fallbackInput);
    }

    setCopyState({ id: btnId, success: copied });
    setTimeout(() => setCopyState(null), 2200);
  };

  const toggleSpoiler = (id: string, defaultValue = false) => {
    setRevealedSpoilers(prev => ({ ...prev, [id]: !(prev[id] ?? defaultValue) }));
  };

  const allButtons = buttons.flat();
  const hasContent = blocks.some((block) =>
    Boolean(block.content?.trim() || block.metadata?.mediaUrl || block.metadata?.localMediaId || block.metadata?.mediaUrls?.length || block.metadata?.localMediaIds?.length || block.metadata?.mapLocation),
  );

  return (
    <div className="w-full max-w-lg mx-auto py-2 text-left animate-fade-in">
      {/* Telegram Chat Background Wallpaper */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0e1621] border border-slate-800 shadow-2xl p-3 sm:p-4">
        {/* Subtle Telegram chat pattern background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* Message Bubble Container */}
        <div className="relative max-w-md ml-auto sm:mx-auto bg-[#182533] rounded-2xl border border-[#2b3c4f]/60 shadow-lg overflow-hidden">
          {/* Channel Header inside post */}
          <div className="px-3.5 pt-3 pb-1.5 flex items-center space-x-2.5 border-b border-[#2b3c4f]/40">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
              {activeChannel?.avatarUrl ? (
                <img src={activeChannel.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                activeChannel?.title?.charAt(0) || 'K'
              )}
            </div>
            <div className="flex items-center space-x-1.5 overflow-hidden">
              <span className="font-bold text-xs text-sky-400 truncate">
                {activeChannel?.title || 'NOVAESP | OFFICIAL'}
              </span>
              {activeChannel?.verified && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="p-3.5 space-y-2.5 text-sm text-[#f5f5f5] leading-relaxed">
            {!hasContent && (
              <p className="text-slate-500 italic text-xs">No content blocks yet...</p>
            )}

            {blocks.map((block) => {
              switch (block.type) {
                case 'photo': {
                  const spoilerHidden = block.metadata?.mediaSpoiler === true && !revealedSpoilers[block.id];
                  if (!block.metadata?.mediaUrl) {
                    return block.metadata?.localMediaId
                      ? <DeviceMediaPreview key={block.id} localMediaId={block.metadata.localMediaId} type="photo" caption={block.content} spoiler={spoilerHidden} onReveal={() => toggleSpoiler(block.id)} />
                      : block.content ? <p key={block.id} className="text-xs text-slate-200">{block.content}</p> : null;
                  }
                  return (
                    <figure key={block.id} className="relative overflow-hidden rounded-xl border border-slate-700/70 bg-black/30">
                      <img src={block.metadata.mediaUrl} alt={block.content || 'Post media'} className={`max-h-80 w-full object-cover transition ${spoilerHidden ? 'select-none blur-xl brightness-75' : ''}`} />
                      {spoilerHidden && <button type="button" onClick={() => toggleSpoiler(block.id)} className="absolute inset-0 flex items-center justify-center bg-slate-950/30 text-xs font-bold text-white">Tap to reveal spoiler</button>}
                      {block.content && <figcaption className="px-3 py-2 text-xs text-slate-200">{block.content}</figcaption>}
                    </figure>
                  );
                }

                case 'collage':
                case 'slideshow': {
                  const mediaUrls = block.metadata?.mediaUrls || [];
                  const localMediaIds = block.metadata?.localMediaIds || [];
                  if (mediaUrls.length === 0 && localMediaIds.length === 0) {
                    return block.content ? <p key={block.id} className="text-xs text-slate-200">{block.content}</p> : null;
                  }
                  return (
                    <figure key={block.id} className="overflow-hidden rounded-xl border border-slate-700/70 bg-black/30">
                      <div className="grid grid-cols-2 gap-1 p-1">
                        {mediaUrls.map((url, index) => (
                          <div key={`${url}-${index}`} className="aspect-video overflow-hidden rounded">
                            <img src={url} alt={`Gallery item ${index + 1}`} className="h-full w-full object-cover" />
                          </div>
                        ))}
                        {localMediaIds.map((localMediaId) => <DeviceMediaPreview key={localMediaId} localMediaId={localMediaId} type="photo" />)}
                      </div>
                      {block.content && <figcaption className="px-3 py-2 text-xs text-slate-200">{block.content}</figcaption>}
                    </figure>
                  );
                }

                case 'video': {
                  const spoilerHidden = block.metadata?.mediaSpoiler === true && !revealedSpoilers[block.id];
                  if (!block.metadata?.mediaUrl) {
                    return block.metadata?.localMediaId
                      ? <DeviceMediaPreview key={block.id} localMediaId={block.metadata.localMediaId} type="video" caption={block.content} spoiler={spoilerHidden} onReveal={() => toggleSpoiler(block.id)} />
                      : block.content ? <p key={block.id} className="text-xs text-slate-200">{block.content}</p> : null;
                  }
                  return (
                    <figure key={block.id} className="relative overflow-hidden rounded-xl border border-slate-700/70 bg-black/30">
                      <video src={block.metadata.mediaUrl} controls playsInline preload="metadata" className={`max-h-80 w-full bg-black object-contain ${spoilerHidden ? 'pointer-events-none select-none blur-xl brightness-75' : ''}`} />
                      {spoilerHidden && <button type="button" onClick={() => toggleSpoiler(block.id)} className="absolute inset-0 flex items-center justify-center bg-slate-950/30 text-xs font-bold text-white">Tap to reveal spoiler</button>}
                      {block.content && <figcaption className="px-3 py-2 text-xs text-slate-200">{block.content}</figcaption>}
                    </figure>
                  );
                }

                case 'animation': {
                  const spoilerHidden = block.metadata?.mediaSpoiler === true && !revealedSpoilers[block.id];
                  if (!block.metadata?.mediaUrl) {
                    return block.metadata?.localMediaId
                      ? <DeviceMediaPreview key={block.id} localMediaId={block.metadata.localMediaId} type="animation" caption={block.content} spoiler={spoilerHidden} onReveal={() => toggleSpoiler(block.id)} />
                      : block.content ? <p key={block.id} className="text-xs text-slate-200">{block.content}</p> : null;
                  }
                  const isRoundVideo = block.metadata?.mediaKind === 'roundVideo';
                  return isRoundVideo ? (
                    <figure key={block.id} className="flex flex-col items-center gap-2 rounded-xl border border-slate-700/70 bg-black/30 py-3">
                      <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-sky-400/70 shadow-lg">
                        <video src={block.metadata.mediaUrl} autoPlay loop muted playsInline className="h-full w-full object-cover" />
                      </div>
                      {block.content && <figcaption className="px-3 text-center text-xs text-slate-200">{block.content}</figcaption>}
                    </figure>
                  ) : (
                    <figure key={block.id} className="relative overflow-hidden rounded-xl border border-slate-700/70 bg-black/30">
                      <img src={block.metadata.mediaUrl} alt={block.content || 'Animation'} className={`max-h-80 w-full object-cover ${spoilerHidden ? 'select-none blur-xl brightness-75' : ''}`} />
                      {spoilerHidden && <button type="button" onClick={() => toggleSpoiler(block.id)} className="absolute inset-0 flex items-center justify-center bg-slate-950/30 text-xs font-bold text-white">Tap to reveal spoiler</button>}
                      {block.content && <figcaption className="px-3 py-2 text-xs text-slate-200">{block.content}</figcaption>}
                    </figure>
                  );
                }

                case 'audio':
                case 'voice': {
                  const isVoice = block.type === 'voice';
                  if (!block.metadata?.mediaUrl) {
                    return block.metadata?.localMediaId
                      ? <DeviceMediaPreview key={block.id} localMediaId={block.metadata.localMediaId} type={block.type} caption={block.content} />
                      : block.content ? <p key={block.id} className="text-xs text-slate-200">{block.content}</p> : null;
                  }
                  const AudioIcon = isVoice ? Mic : Music2;
                  return (
                    <div key={block.id} className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-sky-300">
                        <AudioIcon className="h-4 w-4" aria-hidden="true" />
                        <span>{isVoice ? 'Voice message' : 'Audio track'}</span>
                      </div>
                      <audio src={block.metadata.mediaUrl} controls preload="metadata" className="h-9 w-full" />
                      {block.content && <p className="mt-2 text-xs text-slate-200">{block.content}</p>}
                    </div>
                  );
                }

                case 'map': {
                  const location = block.metadata?.mapLocation;
                  const label = location?.address || block.content || (location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'Map location');
                  const mapUrl = location ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}` : undefined;
                  const mapCard = (
                    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-100">
                      <MapPin className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
                      <span className="truncate">{label}</span>
                      {mapUrl && <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden="true" />}
                    </div>
                  );
                  return mapUrl ? (
                    <a key={block.id} href={mapUrl} target="_blank" rel="noreferrer" aria-label={`Open ${label} in maps`}>{mapCard}</a>
                  ) : <div key={block.id}>{mapCard}</div>;
                }

                case 'heading': {
                  const level = block.metadata?.level || 1;
                  const headingSize = {
                    1: 'text-xl',
                    2: 'text-lg',
                    3: 'text-base',
                    4: 'text-sm',
                    5: 'text-[13px]',
                    6: 'text-xs',
                  }[level];
                  return (
                    <div
                      key={block.id}
                      className={`font-bold text-white ${headingSize} ${level <= 2 ? 'underline decoration-sky-500/70 underline-offset-4' : ''}`}
                    >
                      {block.content || 'Heading Title'}
                    </div>
                  );
                }

                case 'paragraph': {
                  return (
                    <div
                      key={block.id}
                      className="text-[13.5px] leading-relaxed text-slate-100 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: parseInlineToHtml(block.content || '') }}
                    />
                  );
                }

                case 'quote': {
                  return (
                    <div
                      key={block.id}
                      className="border-l-[3px] border-sky-400 bg-sky-500/10 rounded-r-lg px-3 py-2 text-xs italic text-sky-100 space-y-1"
                    >
                      <div dangerouslySetInnerHTML={{ __html: parseInlineToHtml(block.content || '') }} />
                      {block.metadata?.author && (
                        <div className="text-[11px] text-sky-300 font-medium">— {block.metadata.author}</div>
                      )}
                    </div>
                  );
                }

                case 'pullquote': {
                  return (
                    <div
                      key={block.id}
                      className="border-l-[3px] border-indigo-400 bg-indigo-500/10 rounded-r-lg px-3 py-2 text-xs italic text-indigo-100 space-y-1"
                    >
                      <div dangerouslySetInnerHTML={{ __html: parseInlineToHtml(block.content || '') }} />
                      {block.metadata?.author && (
                        <div className="text-[11px] text-indigo-300 font-medium">— {block.metadata.author}</div>
                      )}
                    </div>
                  );
                }

                case 'fold': {
                  const isRevealed = revealedSpoilers[block.id] ?? Boolean(block.metadata?.foldOpen);
                  return (
                    <button
                      type="button"
                      key={block.id}
                      onClick={() => toggleSpoiler(block.id, Boolean(block.metadata?.foldOpen))}
                      className="w-full space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-left text-xs transition hover:bg-amber-500/15"
                      aria-expanded={isRevealed}
                    >
                      <span className="flex items-center justify-between font-bold text-amber-300">
                        <span className="flex items-center gap-1.5">
                          {!block.metadata?.hiddenTitle && <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />}
                          <span>{block.metadata?.hiddenTitle || 'Spoiler (tap to reveal)'}</span>
                        </span>
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </span>
                      <span className={`block transition-all duration-200 ${isRevealed ? 'text-slate-200' : 'tg-spoiler'}`}>
                        {block.content || 'Hidden secret text'}
                      </span>
                    </button>
                  );
                }

                case 'code': {
                  return (
                    <pre
                      key={block.id}
                      className="bg-[#0f172a] border border-slate-700/80 rounded-xl p-3 overflow-x-auto text-xs font-mono text-emerald-300"
                    >
                      <code>{block.content || '// Code snippet'}</code>
                    </pre>
                  );
                }

                case 'math': {
                  return (
                    <div key={block.id} className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs text-violet-100">
                      <Sigma className="h-4 w-4 shrink-0 text-violet-300" aria-hidden="true" />
                      <code className="overflow-x-auto font-mono">{block.content || 'Formula'}</code>
                    </div>
                  );
                }

                case 'table': {
                  const rows = Array.isArray(block.metadata?.tableData) && block.metadata.tableData.length > 0
                    ? block.metadata.tableData
                    : (block.content || '').split(/\r?\n/).filter(Boolean).map((row) => row.split('|').map((cell) => cell.trim()));
                  return (
                    <div key={block.id} className="overflow-x-auto rounded-xl border border-slate-700/80 bg-[#0f172a] p-1.5">
                      <table className="min-w-full border-separate border-spacing-0 text-left text-xs text-slate-200">
                        <tbody>
                          {(rows.length > 0 ? rows : [['Table content']]).map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex === 0 && (block.metadata?.tableHasHeader ?? true) ? 'bg-sky-500/10 text-sky-100' : ''}>
                              {row.map((cell, columnIndex) => (
                                <td key={columnIndex} className="border-b border-r border-slate-700/70 px-2.5 py-2 last:border-r-0">{cell || '—'}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                case 'list': {
                  const items = (block.content || '').split('\n').filter(i => i.trim() !== '');
                  const isNumber = block.metadata?.style === 'number';
                  return (
                    <div key={block.id} className="space-y-1 text-xs text-slate-200">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <span className="text-sky-400 font-bold shrink-0">{isNumber ? `${idx + 1}.` : '•'}</span>
                          <span dangerouslySetInnerHTML={{ __html: parseInlineToHtml(item) }} />
                        </div>
                      ))}
                    </div>
                  );
                }

                case 'divider': {
                  return (
                    <div key={block.id} className="py-1">
                      <div className="border-t border-slate-700/60"></div>
                    </div>
                  );
                }

                case 'footer': {
                  return (
                    <div key={block.id} className="text-[11px] text-slate-400 italic">
                      {block.content}
                    </div>
                  );
                }

                default:
                  return (
                    <div key={block.id} className="text-xs text-slate-200">
                      {block.content}
                    </div>
                  );
              }
            })}

            {/* Post meta footer */}
            <div className="flex items-center justify-end space-x-1.5 text-[10px] text-slate-400 pt-1">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <CheckCheck className="w-3 h-3 text-sky-400" />
            </div>
          </div>

          {/* Inline Buttons (Interactive live preview) */}
          {allButtons.length > 0 && (
            <div className="p-2 pt-0 space-y-1.5">
              {buttons.map((row, rIdx) => (
                <div key={rIdx} className="flex space-x-1.5">
                  {row.map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => {
                        if (btn.type === 'copy') {
                          void handleCopyClick(btn.id, btn.copyText);
                        } else if (btn.type === 'link' && btn.url) {
                          window.open(btn.url, '_blank', 'noopener,noreferrer');
                        } else if (btn.type === 'webapp' && btn.webappUrl) {
                          window.open(btn.webappUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#3b4f66] bg-[#293a4c] px-3 py-2 text-xs font-bold text-sky-300 shadow-sm transition hover:bg-[#34485e] hover:text-white active:scale-[0.98]"
                      aria-label={btn.text || `${btn.type} button`}
                    >
                      {btn.type === 'link' && <ExternalLink className="w-3.5 h-3.5 shrink-0" />}
                      {btn.type === 'copy' && (
                        copyState?.id === btn.id && copyState.success ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 shrink-0" />
                        )
                      )}
                      {btn.type === 'webapp' && <AppWindow className="w-3.5 h-3.5 shrink-0" />}
                      <span>
                        {copyState?.id === btn.id
                          ? copyState.success ? 'Copied!' : 'Unable to copy'
                          : btn.text || 'Button'}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
