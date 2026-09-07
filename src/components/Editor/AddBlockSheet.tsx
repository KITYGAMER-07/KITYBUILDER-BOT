import React from 'react';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Bottom Sheet Modal (Matching Screenshot 1) */}
      <div className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-slate-700/80 bg-[#17212b] p-4 pb-8 shadow-2xl sm:max-w-md sm:rounded-3xl sm:border sm:p-5 sm:pb-6">
        {/* Drag Handle Bar */}
        <div className="w-10 h-1 rounded-full bg-slate-600/60 mx-auto mb-4 sm:hidden"></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white text-left">Add Block</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close add block menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Standard Grid */}
        <div className="mb-6 grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {standardBlocks.map((block) => (
            <button
              key={block.type}
              onClick={() => handleSelect(block.type)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#111923]/90 hover:bg-[#1f2c3d] border border-slate-800/80 hover:border-sky-500/40 text-sky-400 hover:text-sky-300 transition-all duration-150 active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center mb-1.5 group-hover:bg-sky-500/20 transition">
                {block.icon}
              </div>
              <span className="text-[11px] font-medium text-slate-300 group-hover:text-white">
                {block.label}
              </span>
            </button>
          ))}
        </div>

        {/* Advanced blocks */}
        <div className="border-t border-slate-800 pt-4">
          <div className="mb-3 flex items-center gap-1.5 text-left">
            <Zap className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
            <span className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
              Advanced blocks
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {advancedBlocks.map((block) => (
              <button
                key={block.type}
                onClick={() => handleSelect(block.type)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#111923]/90 hover:bg-[#1f2c3d] border border-slate-800/80 hover:border-sky-500/40 text-sky-400 hover:text-sky-300 transition-all duration-150 active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center mb-1.5 group-hover:bg-sky-500/20 transition">
                  {block.icon}
                </div>
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-white">
                  {block.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
