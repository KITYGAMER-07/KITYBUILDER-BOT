import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { onValue, ref, remove, set } from 'firebase/database';
import type { ContentBlock, ButtonRow, TelegramChannel, PostDraft, BotInfo, InlineButton } from '../types';
import { firebaseAuth, firebaseDatabase } from '../services/firebase';
import { brandBotRequest } from '../services/api';
import { createPublishFormData, removeLocalMedia } from '../services/localMedia';

interface AppContextType {
  currentView: 'dashboard' | 'editor';
  setCurrentView: (view: 'dashboard' | 'editor') => void;
  editorTab: 'write' | 'preview';
  setEditorTab: (tab: 'write' | 'preview') => void;
  
  // Channels
  channels: TelegramChannel[];
  activeChannel: TelegramChannel | null;
  setActiveChannel: (channel: TelegramChannel | null) => void;
  addChannel: (channelId: string) => Promise<{ success: boolean; error?: string }>;
  deleteChannel: (id: string) => Promise<void>;
  
  // Post Editor State
  blocks: ContentBlock[];
  buttons: ButtonRow[];
  setBlocks: React.Dispatch<React.SetStateAction<ContentBlock[]>>;
  setButtons: React.Dispatch<React.SetStateAction<ButtonRow[]>>;
  addBlock: (type: ContentBlock['type'], content?: string, metadata?: ContentBlock['metadata']) => void;
  updateBlock: (id: string, content: string, metadata?: ContentBlock['metadata']) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  
  // Buttons Builder
  addButton: (button: Omit<InlineButton, 'id'>, rowIndex?: number) => void;
  updateButton: (id: string, updated: Partial<InlineButton>) => void;
  removeButton: (id: string) => void;
  
  // Drafts
  drafts: PostDraft[];
  activeDraftId: string | null;
  saveCurrentDraft: () => Promise<void>;
  loadDraft: (draft: PostDraft) => void;
  deleteDraft: (id: string) => Promise<void>;
  startNewPost: () => void;
  
  // Bot & Publishing
  botInfo: BotInfo | null;
  isPublishing: boolean;
  publishPost: (options?: { disableNotification?: boolean; pinMessage?: boolean }) => Promise<{ success: boolean; error?: string }>;

  // Theme & Language
  language: 'en' | 'ta';
  setLanguage: (lang: 'en' | 'ta') => void;
  theme: 'dark' | 'telegram' | 'light';
  setTheme: (theme: 'dark' | 'telegram' | 'light') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const asCollection = <T,>(value: unknown): T[] => {
  if (!value || typeof value !== 'object') return [];
  return Object.values(value as Record<string, T>);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  
  // Default is completely EMPTY channels
  const [channels, setChannels] = useState<TelegramChannel[]>(() => {
    const saved = localStorage.getItem('kity_channels_v2');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeChannel, setActiveChannel] = useState<TelegramChannel | null>(() => channels[0] || null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [buttons, setButtons] = useState<ButtonRow[]>([]);
  const [drafts, setDrafts] = useState<PostDraft[]>(() => {
    const saved = localStorage.getItem('kity_drafts_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  // Default theme is ALWAYS pure DARK
  const [theme, setTheme] = useState<'dark' | 'telegram' | 'light'>('dark');
  const [firebaseUserId, setFirebaseUserId] = useState<string | null>(null);
  const [firebaseHydrated, setFirebaseHydrated] = useState(false);
  const refreshedChannelIds = useRef(new Set<string>());

  // Ensure HTML has dark class
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language === 'ta' ? 'ta' : 'en';
  }, [language]);

  // Initialize Telegram WebApp SDK if available in iframe/Telegram client
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
    }
  }, []);

  // Fetch the public identity of the one brand bot from the publish backend.
  const fetchInfo = () => {
    brandBotRequest('/api/info')
      .then(data => {
        setBotInfo(data.botInfo || null);
      })
      .catch(() => {
        setBotInfo(null);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  // Each visitor gets an anonymous Firebase identity, so their drafts and channels
  // can be stored under their own protected database path without a sign-up screen.
  useEffect(() => {
    let disposed = false;
    let signInRequested = false;
    let activeUserId: string | null = null;
    let stopChannels = () => {};
    let stopDrafts = () => {};

    const hydrate = (userId: string) => {
      if (activeUserId === userId) return;
      activeUserId = userId;
      stopChannels();
      stopDrafts();
      setFirebaseUserId(userId);

      let channelsLoaded = false;
      let draftsLoaded = false;
      const markHydrated = () => {
        if (!disposed && channelsLoaded && draftsLoaded) setFirebaseHydrated(true);
      };

      stopChannels = onValue(
        ref(firebaseDatabase, `users/${userId}/channels`),
        (snapshot) => {
          if (disposed) return;
          const syncedChannels = asCollection<TelegramChannel>(snapshot.val());
          setChannels(syncedChannels);
          setActiveChannel(syncedChannels[0] || null);
          channelsLoaded = true;
          markHydrated();
        },
        () => {
          channelsLoaded = true;
          markHydrated();
        },
      );

      stopDrafts = onValue(
        ref(firebaseDatabase, `users/${userId}/drafts`),
        (snapshot) => {
          if (disposed) return;
          const syncedDrafts = asCollection<PostDraft>(snapshot.val()).sort((a, b) => b.updatedAt - a.updatedAt);
          setDrafts(syncedDrafts);
          draftsLoaded = true;
          markHydrated();
        },
        () => {
          draftsLoaded = true;
          markHydrated();
        },
      );
    };

    const stopAuth = onAuthStateChanged(firebaseAuth, (user) => {
      if (disposed) return;
      if (user) {
        hydrate(user.uid);
        return;
      }

      if (!signInRequested) {
        signInRequested = true;
        signInAnonymously(firebaseAuth).catch(() => {
          if (!disposed) {
            setFirebaseUserId(null);
            setFirebaseHydrated(false);
          }
        });
      }
    });

    return () => {
      disposed = true;
      stopAuth();
      stopChannels();
      stopDrafts();
    };
  }, []);

  // Sync channels to local storage
  useEffect(() => {
    localStorage.setItem('kity_channels_v2', JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem('kity_drafts_v2', JSON.stringify(drafts));
  }, [drafts]);

  // Existing channels are refreshed once per visit so the dashboard always uses
  // Telegram's actual member count instead of a made-up placeholder value.
  useEffect(() => {
    if (!firebaseUserId || !firebaseHydrated || channels.length === 0) return;

    const currentIds = new Set(channels.map((channel) => channel.id));
    refreshedChannelIds.current.forEach((id) => {
      if (!currentIds.has(id)) refreshedChannelIds.current.delete(id);
    });

    channels
      .filter((channel) => !refreshedChannelIds.current.has(channel.id))
      .forEach((channel) => {
        refreshedChannelIds.current.add(channel.id);
        const channelId = channel.username ? `@${channel.username}` : channel.id;

        brandBotRequest('/api/channels/verify', {
          method: 'POST',
          body: JSON.stringify({ channelId }),
        })
          .then(async (data) => {
            if (!data?.success || !data.channel) return;
            await set(ref(firebaseDatabase, `users/${firebaseUserId}/channels/${data.channel.id}`), data.channel);
            setChannels((current) => current.map((item) => item.id === data.channel.id ? data.channel : item));
            setActiveChannel((current) => current?.id === data.channel.id ? data.channel : current);
          })
          .catch(() => {
            // Keep the existing saved channel available if the refresh is temporarily unavailable.
          });
      });
  }, [channels, firebaseHydrated, firebaseUserId]);

  const addBlock = (type: ContentBlock['type'], content = '', metadata = {}) => {
    const newBlock: ContentBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      content,
      metadata: { ...metadata },
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = (id: string, content: string, metadata?: ContentBlock['metadata']) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === id) {
        return {
          ...block,
          content,
          metadata: metadata ? { ...block.metadata, ...metadata } : block.metadata
        };
      }
      return block;
    }));
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => {
      const removed = prev.find((block) => block.id === id);
      const localIds = [removed?.metadata?.localMediaId, ...(removed?.metadata?.localMediaIds || [])].filter(Boolean) as string[];
      localIds.forEach((localId) => void removeLocalMedia(localId).catch(() => undefined));
      return prev.filter(b => b.id !== id);
    });
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;
      
      const newBlocks = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[targetIndex];
      newBlocks[targetIndex] = temp;
      return newBlocks;
    });
  };

  const addButton = (btnData: Omit<InlineButton, 'id'>, rowIndex = -1) => {
    const newBtn: InlineButton = {
      id: `btn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...btnData
    };

    setButtons(prev => {
      if (rowIndex >= 0 && rowIndex < prev.length) {
        const newRows = [...prev];
        newRows[rowIndex] = [...newRows[rowIndex], newBtn];
        return newRows;
      }
      return [...prev, [newBtn]];
    });
  };

  const updateButton = (id: string, updated: Partial<InlineButton>) => {
    setButtons(prev => prev.map(row => 
      row.map(btn => btn.id === id ? { ...btn, ...updated } : btn)
    ));
  };

  const removeButton = (id: string) => {
    setButtons(prev => prev.map(row => row.filter(btn => btn.id !== id)).filter(row => row.length > 0));
  };

  const saveCurrentDraft = async () => {
    const draftTitle = blocks.find(b => b.content?.trim())?.content?.substring(0, 35) || 'Untitled Post';
    const draftPayload: PostDraft = {
      id: activeDraftId || `draft_${Date.now()}`,
      title: draftTitle,
      targetChannelId: activeChannel?.id,
      blocks,
      buttons,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (firebaseUserId && firebaseHydrated) {
      try {
        await set(ref(firebaseDatabase, `users/${firebaseUserId}/drafts/${draftPayload.id}`), draftPayload);
        setActiveDraftId(draftPayload.id);
        setDrafts(prev => [draftPayload, ...prev.filter(d => d.id !== draftPayload.id)]);
        return;
      } catch {
        // Keep the existing local fallback available if Firebase is temporarily unavailable.
      }
    }

    // Firebase is the shared store. Local storage below remains a safe offline fallback.
    setActiveDraftId(draftPayload.id);
    setDrafts(prev => [draftPayload, ...prev.filter(d => d.id !== draftPayload.id)]);
  };

  const loadDraft = (draft: PostDraft) => {
    setActiveDraftId(draft.id);
    setBlocks(draft.blocks || []);
    setButtons(draft.buttons || []);
    if (draft.targetChannelId) {
      const foundChannel = channels.find(c => c.id === draft.targetChannelId);
      if (foundChannel) setActiveChannel(foundChannel);
    }
    setCurrentView('editor');
    setEditorTab('write');
  };

  const deleteDraft = async (id: string) => {
    if (firebaseUserId && firebaseHydrated) {
      try {
        await remove(ref(firebaseDatabase, `users/${firebaseUserId}/drafts/${id}`));
      } catch {
        // The local update below still lets the user continue working.
      }
    }
    setDrafts(prev => prev.filter(d => d.id !== id));
    if (activeDraftId === id) {
      setActiveDraftId(null);
    }
  };

  const startNewPost = () => {
    setActiveDraftId(null);
    setBlocks([]);
    setButtons([]);
    setCurrentView('editor');
    setEditorTab('write');
  };

  const addChannel = async (channelId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const data = await brandBotRequest('/api/channels/verify', {
        method: 'POST',
        body: JSON.stringify({ channelId })
      });
      if (data.success && data.channel) {
        if (firebaseUserId && firebaseHydrated) {
          try {
            await set(ref(firebaseDatabase, `users/${firebaseUserId}/channels/${data.channel.id}`), data.channel);
          } catch {
            // Keep the channel locally available if Firebase is temporarily unavailable.
          }
        }
        setChannels(prev => {
          const filtered = prev.filter(c => c.id !== data.channel.id);
          return [...filtered, data.channel];
        });
        setActiveChannel(data.channel);
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to verify channel' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error' };
    }
  };

  const deleteChannel = async (id: string) => {
    if (firebaseUserId && firebaseHydrated) {
      try {
        await remove(ref(firebaseDatabase, `users/${firebaseUserId}/channels/${id}`));
      } catch {
        // The local update below still lets the user continue working.
      }
    }
    const updated = channels.filter(c => c.id !== id);
    setChannels(updated);
    if (activeChannel?.id === id) {
      setActiveChannel(updated[0] || null);
    }
  };

  const publishPost = async (options?: { disableNotification?: boolean; pinMessage?: boolean }): Promise<{ success: boolean; error?: string }> => {
    if (!activeChannel) {
      return { success: false, error: 'Please connect and select a Telegram channel first' };
    }
    if (blocks.length === 0) {
      return { success: false, error: 'Canvas is empty! Add blocks before posting' };
    }

    setIsPublishing(true);
    try {
      const mediaPayload = await createPublishFormData({
        channelId: activeChannel.id,
        publishGrant: activeChannel.publishGrant,
        buttons,
        disableNotification: options?.disableNotification,
        pinMessage: options?.pinMessage,
      }, blocks);
      const data = await brandBotRequest('/api/publish', {
        method: 'POST',
        body: mediaPayload,
      });
      setIsPublishing(false);
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to publish post' };
      }
    } catch (err: any) {
      setIsPublishing(false);
      return { success: false, error: err.message || 'Network error while publishing' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        editorTab,
        setEditorTab,
        channels,
        activeChannel,
        setActiveChannel,
        addChannel,
        deleteChannel,
        blocks,
        buttons,
        setBlocks,
        setButtons,
        addBlock,
        updateBlock,
        removeBlock,
        moveBlock,
        addButton,
        updateButton,
        removeButton,
        drafts,
        activeDraftId,
        saveCurrentDraft,
        loadDraft,
        deleteDraft,
        startNewPost,
        botInfo,
        isPublishing,
        publishPost,
        language,
        setLanguage,
        theme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
