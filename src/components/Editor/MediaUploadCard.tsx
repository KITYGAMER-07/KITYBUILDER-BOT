import React, { useEffect, useId, useState } from 'react';
import { FileAudio, FileVideo, ImagePlus, LoaderCircle, Trash2, Upload } from 'lucide-react';
import type { BlockType } from '../../types';
import { getLocalMedia, removeLocalMedia, saveLocalMedia } from '../../services/localMedia';

type UploadableType = Extract<BlockType, 'photo' | 'video' | 'animation' | 'audio' | 'voice'>;

interface Props {
  type: UploadableType;
  localMediaId?: string;
  onUploaded: (id: string) => void;
  onRemove?: () => void;
  compact?: boolean;
}

const configuration: Record<UploadableType, { accept: string; label: string; helper: string; maxBytes: number }> = {
  photo: { accept: 'image/jpeg,image/png,image/webp', label: 'Tap to upload photo', helper: 'JPG · PNG · WEBP · max 10 MB', maxBytes: 10 * 1024 * 1024 },
  video: { accept: 'video/mp4,video/quicktime,video/webm', label: 'Tap to upload video', helper: 'MP4 · MOV · WEBM · max 50 MB', maxBytes: 50 * 1024 * 1024 },
  animation: { accept: 'image/gif,video/mp4,video/webm', label: 'Tap to upload animation', helper: 'GIF · MP4 · WEBM · max 50 MB', maxBytes: 50 * 1024 * 1024 },
  audio: { accept: 'audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/ogg', label: 'Tap to upload audio', helper: 'MP3 · M4A · WAV · OGG · max 50 MB', maxBytes: 50 * 1024 * 1024 },
  voice: { accept: 'audio/ogg,audio/opus,audio/mpeg', label: 'Tap to upload voice', helper: 'OGG recommended · max 50 MB', maxBytes: 50 * 1024 * 1024 },
};

export const MediaUploadCard: React.FC<Props> = ({ type, localMediaId, onUploaded, onRemove, compact = false }) => {
  const inputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const config = configuration[type];

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    const load = async () => {
      if (!localMediaId) {
        if (active) {
          setFile(null);
          setPreviewUrl(null);
        }
        return;
      }
      const selectedFile = await getLocalMedia(localMediaId).catch(() => null);
      if (!active) return;
      setFile(selectedFile);
      if (selectedFile) {
        objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
      } else {
        setPreviewUrl(null);
      }
    };

    void load();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [localMediaId]);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = '';
    if (!selectedFile) return;

    if (selectedFile.size > config.maxBytes) {
      setError(`${config.label.replace('Tap to upload ', '')} must be smaller than ${config.maxBytes / 1024 / 1024} MB.`);
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const id = await saveLocalMedia(selectedFile);
      if (localMediaId) await removeLocalMedia(localMediaId).catch(() => undefined);
      onUploaded(id);
    } catch {
      setError('This file could not be prepared on this device. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async () => {
    if (localMediaId) await removeLocalMedia(localMediaId).catch(() => undefined);
    onRemove?.();
  };

  const Icon = type === 'photo' || type === 'animation' ? ImagePlus : type === 'audio' || type === 'voice' ? FileAudio : FileVideo;

  if (compact) {
    return (
      <label htmlFor={inputId} className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-dashed border-sky-500/40 bg-sky-500/5 text-sky-400 transition hover:bg-sky-500/10">
        <input id={inputId} type="file" accept={config.accept} className="sr-only" onChange={handleFile} disabled={isSaving} />
        {isSaving ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
      </label>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="group relative flex min-h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-600 bg-[#111923] p-4 text-center transition hover:border-sky-500/60 hover:bg-[#142334]">
        <input id={inputId} type="file" accept={config.accept} className="sr-only" onChange={handleFile} disabled={isSaving} />
        {previewUrl && file?.type.startsWith('image/') ? (
          <img src={previewUrl} alt="Selected upload" className="absolute inset-0 h-full w-full object-cover" />
        ) : previewUrl && file?.type.startsWith('video/') ? (
          <video src={previewUrl} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
        ) : (
          <>
            <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 text-sky-400 transition group-hover:bg-sky-500/25">
              {isSaving ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <Icon className="h-6 w-6" />}
            </span>
            <span className="text-sm font-semibold text-slate-200">{isSaving ? 'Preparing file…' : file ? file.name : config.label}</span>
            <span className="mt-1 text-[11px] text-slate-500">{file ? 'This device only until you publish' : config.helper}</span>
          </>
        )}
      </label>
      {file && (type === 'audio' || type === 'voice') && <audio src={previewUrl || undefined} controls className="w-full" />}
      {file && onRemove && (
        <button type="button" onClick={() => void remove()} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10">
          <Trash2 className="h-3.5 w-3.5" />
          Remove file
        </button>
      )}
      {error && <p className="text-xs font-medium text-rose-400">{error}</p>}
    </div>
  );
};

export const LocalMediaThumbnail: React.FC<{ localMediaId: string; onRemove: () => void }> = ({ localMediaId, onRemove }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [name, setName] = useState('Photo ready');

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    void getLocalMedia(localMediaId).then((file) => {
      if (!file || !active) return;
      objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
      setName(file.name);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [localMediaId]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      {url ? <img src={url} alt={name} className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-slate-500">Ready</span>}
      <button
        type="button"
        onClick={() => {
          void removeLocalMedia(localMediaId).finally(onRemove);
        }}
        className="absolute right-1 top-1 rounded-md bg-black/70 p-1 text-white transition hover:bg-rose-600"
        aria-label={`Remove ${name}`}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
};
