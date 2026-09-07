import React, { useEffect } from 'react';
import type { BlockType } from '../../types';
import {
  ListOrdered,
  Heading1,
  Pilcrow,
  Quote,
  FileText,
  Image as ImageIcon,
  Images,
  Music,
  MapPin,
  Code2,
  Sigma,
  Table as TableIcon,
  Minus,
  Video,
  Mic,
  EyeOff,
  LayoutGrid,
  Film,
  Zap,
  X
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: BlockType) => void;
}

interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
  isNew?: boolean;
}

export const AddBlockSheet: React.FC<Props> = ({ isOpen, onClose, onSelectBlock }) => {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const standardBlocks: BlockDefinition[] = [
    { type: 'heading', label: 'Heading', icon: <Heading1 className="w-5 h-5" /> },
    { type: 'paragraph', label: 'Paragraph', icon: <Pilcrow className="w-5 h-5" /> },
    { type: 'quote', label: 'Quote', icon: <Quote className="w-5 h-5" /> },
    { type: 'footer', label: 'Footer', icon: <FileText className="w-5 h-5" /> },
    { type: 'list', label: 'List', icon: <ListOrdered className="w-5 h-5" /> },
    { type: 'photo', label: 'Photo', icon: <ImageIcon className="w-5 h-5" /> },
    { type: 'slideshow', label: 'Slideshow', icon: <Images className="w-5 h-5" /> },
    { type: 'audio', label: 'Audio', icon: <Music className="w-5 h-5" /> },
    { type: 'map', label: 'Map', icon: <MapPin className="w-5 h-5" /> },
    { type: 'code', label: 'Code', icon: <Code2 className="w-5 h-5" /> },
    { type: 'math', label: 'Math', icon: <Sigma className="w-5 h-5" /> },
    { type: 'table', label: 'Table', icon: <TableIcon className="w-5 h-5" /> },
    { type: 'divider', label: 'Divider', icon: <Minus className="w-5 h-5" /> },
  ];

  const advancedBlocks: BlockDefinition[] = [
    { type: 'video', label: 'Video', icon: <Video className="w-5 h-5" /> },
    { type: 'animation', label: 'Animation', icon: <Film className="w-5 h-5" /> },
    { type: 'voice', label: 'Voice', icon: <Mic className="w-5 h-5" /> },
    { type: 'pullquote', label: 'Pull Quote', icon: <Quote className="w-5 h-5" /> },
    { type: 'fold', label: 'Fold', icon: <EyeOff className="w-5 h-5" /> },
    { type: 'collage', label: 'Collage', icon: <LayoutGrid className="w-5 h-5" /> },
  ];

  const handleSelect = (type: BlockType) => {
    onSelectBlock(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center overflow-hidden bg-black/75 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close add block menu"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-block-title"
        className="relative z-10 flex h-[min(88dvh,44rem)] w-full min-h-0 flex-col overflow-hidden rounded-t-[2rem] border-t border-slate-700/80 bg-[#17212b] shadow-2xl sm:h-auto sm:max-h-[80vh] sm:max-w-lg sm:rounded-3xl sm:border"
      >
        <div className="shrink-0 border-b border-slate-800/80 bg-[#17212b] px-4 pb-3 pt-3 sm:px-5 sm:pt-4">
          <div className="mx-auto mb-3 h-1 w-11 rounded-full bg-slate-600/60 sm:hidden" />

          <div className="flex items-center justify-between">
            <h3 id="add-block-title" className="text-lg font-extrabold text-white">Add Block</h3>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close add block menu"
          >
            <X className="w-5 h-5" />
          </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-5 sm:pb-6">
          <div className="grid grid-cols-4 gap-x-2.5 gap-y-4 sm:gap-x-3 sm:gap-y-5">
            {standardBlocks.map((block) => (
              <BlockChoice key={block.type} block={block} onSelect={handleSelect} />
            ))}
          </div>

          <div className="my-6 border-t border-slate-800 pt-4">
            <div className="mb-4 flex items-center gap-2 text-left">
              <Zap className="h-4 w-4 text-sky-400" aria-hidden="true" />
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">
                More blocks
              </span>
            </div>

            <div className="grid grid-cols-4 gap-x-2.5 gap-y-4 sm:gap-x-3 sm:gap-y-5">
              {advancedBlocks.map((block) => (
                <BlockChoice key={block.type} block={block} onSelect={handleSelect} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const BlockChoice: React.FC<{ block: BlockDefinition; onSelect: (type: BlockType) => void }> = ({ block, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(block.type)}
    className="group flex min-w-0 flex-col items-center gap-2 text-center text-sky-400 transition active:scale-95"
  >
    <span className="flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-800/80 bg-[#101923] shadow-inner transition group-hover:border-sky-500/50 group-hover:bg-[#162536] group-hover:text-sky-300">
      {block.icon}
    </span>
    <span className="w-full truncate text-[11px] font-semibold leading-none text-slate-300 transition group-hover:text-white sm:text-xs">
      {block.label}
    </span>
  </button>
);
