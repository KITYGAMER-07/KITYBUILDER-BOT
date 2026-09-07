export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'quote'
  | 'pullquote'
  | 'footer'
  | 'list'
  | 'photo'
  | 'slideshow'
  | 'audio'
  | 'map'
  | 'code'
  | 'math'
  | 'table'
  | 'divider'
  | 'video'
  | 'animation'
  | 'voice'
  | 'fold'
  | 'collage';

export type ButtonType = 'link' | 'copy' | 'webapp';

export interface InlineButton {
  id: string;
  type: ButtonType;
  text: string;
  url?: string;
  copyText?: string;
  webappUrl?: string;
}

export type ButtonRow = InlineButton[];

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  metadata?: {
    level?: 1 | 2 | 3 | 4 | 5 | 6; // for headings
    style?: 'bullet' | 'number'; // for list
    language?: string; // for code
    caption?: string;
    mediaUrl?: string;
    mediaUrls?: string[]; // for slideshow/collage
    // The browser-only reference for a file selected on this device. The bytes are
    // sent straight to Telegram when publishing and are never saved to Firebase.
    localMediaId?: string;
    localMediaIds?: string[];
    // Temporary upload field names used only in the publish request.
    mediaUploadKey?: string;
    mediaUploadKeys?: string[];
    mediaKind?: 'roundVideo'; // distinguishes circular video notes from standard animations
    mediaSpoiler?: boolean; // supported by Telegram for photos, videos and animations
    author?: string; // for quote/pullquote
    hiddenTitle?: string; // for fold/spoiler
    foldOpen?: boolean; // editor preview state for fold blocks
    tableData?: string[][]; // for tables
    tableHasHeader?: boolean;
    mapLocation?: { latitude: number; longitude: number; address?: string };
    duration?: number; // for audio/voice
  };
}

export interface PostDraft {
  id: string;
  title: string;
  targetChannelId?: string;
  blocks: ContentBlock[];
  buttons: ButtonRow[];
  createdAt: number;
  updatedAt: number;
}

export interface TelegramChannel {
  id: string;
  title: string;
  username?: string;
  avatarUrl?: string;
  memberCount?: number;
  isBotAdmin: boolean;
  canPostMessages: boolean;
  canEditMessages: boolean;
  verified?: boolean;
  // Short-lived proof issued by the Worker after the brand bot checks the channel.
  // It is tied to the signed-in Firebase user and is never a Telegram bot token.
  publishGrant?: string;
}

export interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        colorScheme?: 'dark' | 'light';
        initData?: string;
        initDataUnsafe?: any;
      };
    };
  }
}
