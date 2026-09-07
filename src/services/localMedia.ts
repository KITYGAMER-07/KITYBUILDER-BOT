import type { ContentBlock } from '../types';

const DATABASE_NAME = 'kitybuilder-local-media';
const STORE_NAME = 'files';

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, 1);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(STORE_NAME)) {
      request.result.createObjectStore(STORE_NAME);
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('Unable to open local media storage.'));
});

export const saveLocalMedia = async (file: File) => {
  const id = `media_${crypto.randomUUID()}`;
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(file, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Unable to keep this media file on the device.'));
  });
  database.close();
  return id;
};

export const getLocalMedia = async (id: string) => {
  const database = await openDatabase();
  const file = await new Promise<File | null>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result instanceof File ? request.result : null);
    request.onerror = () => reject(request.error || new Error('Unable to read this local media file.'));
  });
  database.close();
  return file;
};

export const removeLocalMedia = async (id: string) => {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Unable to remove local media.'));
  });
  database.close();
};

export const createPublishFormData = async (payload: Record<string, unknown>, blocks: ContentBlock[]) => {
  const formData = new FormData();
  const preparedBlocks = await Promise.all(blocks.map(async (block) => {
    const metadata = { ...block.metadata };

    if (metadata.localMediaId) {
      const file = await getLocalMedia(metadata.localMediaId);
      if (!file) throw new Error('A selected media file is no longer on this device. Add it again before publishing.');
      const uploadKey = `media_${block.id}`;
      formData.append(uploadKey, file, file.name);
      metadata.mediaUploadKey = uploadKey;
      delete metadata.localMediaId;
    }

    if (metadata.localMediaIds?.length) {
      const files = await Promise.all(metadata.localMediaIds.map((id) => getLocalMedia(id)));
      if (files.some((file) => !file)) {
        throw new Error('One or more selected images are no longer on this device. Add them again before publishing.');
      }
      const uploadKeys = files.map((file, index) => {
        const uploadKey = `media_${block.id}_${index}`;
        formData.append(uploadKey, file as File, (file as File).name);
        return uploadKey;
      });
      metadata.mediaUploadKeys = uploadKeys;
      delete metadata.localMediaIds;
    }

    return { ...block, metadata };
  }));

  formData.append('payload', JSON.stringify({ ...payload, blocks: preparedBlocks }));
  return formData;
};
