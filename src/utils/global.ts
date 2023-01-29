import { FileType } from '.prisma/client';
import { getFilePath } from './fileStorage';

export const downloadFile = async (storagePath: string) => {
  const url = await getFilePath(storagePath);
  const response = await fetch(url, { method: 'GET' });
  const blob = await response.blob();

  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', storagePath);

  document.body.appendChild(link);

  link.click();

  (link.parentNode as any).removeChild(link);
};

export const getSimpleRandomKey = () => Math.random().toString(36).substring(2, 15);

export const getFileTypeByText = (type: string): FileType => {
  switch (type) {
    case FileType.thumbnail:
      return FileType.thumbnail;
    case FileType.instruction:
      return FileType.instruction;
    case FileType.scheme:
      return FileType.scheme;
    case FileType.preview:
    default:
      return FileType.preview;
  }
};
