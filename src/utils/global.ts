import { Item, ItemFile } from '.prisma/client';
import { getFilePath } from './fileStorage';

export const downloadFile = async (file: ItemFile & { url: string; item: Item }) => {
  const url = await getFilePath(file.storagePath);
  const response = await fetch(url, { method: 'GET' });
  const blob = await response.blob();

  // Create blob link to download
  // const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', file.storagePath);

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();

  // Clean up and remove the link
  (link.parentNode as any).removeChild(link);
};

export const getSimpleRandomKey = () => Math.random().toString(36).substring(2, 15);
