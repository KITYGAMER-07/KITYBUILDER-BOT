import type { ContentBlock } from '../types';

/**
 * Escapes HTML characters for safe rendering
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Converts Telegram/Markdown inline markers into HTML for live UI preview
 */
export function parseInlineToHtml(text: string): string {
  if (!text) return '';
  let formatted = escapeHtml(text);

  // Bold **text** or *text*
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/(?<!\w)\*(.*?)\*(?!\w)/g, '<strong>$1</strong>');

  // Italic __text__ or _text_
  formatted = formatted.replace(/__(.*?)__/g, '<em>$1</em>');
  formatted = formatted.replace(/(?<!\w)_(.*?)_(?!\w)/g, '<em>$1</em>');

  // Strikethrough ~~text~~ or ~text~
  formatted = formatted.replace(/~~(.*?)~~/g, '<del class="line-through opacity-75">$1</del>');
  formatted = formatted.replace(/(?<!\w)~(.*?)~(?!\w)/g, '<del class="line-through opacity-75">$1</del>');

  // Underline --text--
  formatted = formatted.replace(/--(.*?)--/g, '<u class="underline underline-offset-2">$1</u>');

  // Inline Spoilers ||text||
  formatted = formatted.replace(/\|\|(.*?)\|\|/g, '<span class="tg-spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>');

  // Inline Code `code`
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-[#1e293b] text-[#38bdf8] px-1.5 py-0.5 rounded font-mono text-xs border border-slate-700/60">$1</code>');

  return formatted;
}

/**
 * Calculates estimated Telegram character count
 */
export function calculateTelegramLength(blocks: ContentBlock[]): number {
  return blocks.reduce((acc, block) => acc + (block.content?.length || 0), 0);
}
