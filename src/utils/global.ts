import { Item, ItemFile } from '.prisma/client';

export const downloadFile = async (file: ItemFile & { url: string; item: Item }) => {
  const response = await fetch(file.url, { method: 'GET' });
  const blob = await response.blob();

  // Create blob link to download
  const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', file.id);

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();

  // Clean up and remove the link
  (link.parentNode as any).removeChild(link);
};

export const getSimpleRandomKey = () => Math.random().toString(36).substring(2, 15);
