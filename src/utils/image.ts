/* istanbul ignore file -- @preserve */
// It's not possible to make a real test mocking document.createElement and Image
import { readAndCompressImage } from 'browser-image-resizer';

const generateThumbnailCanvas = (bytes: ArrayBuffer) =>
  new Promise<HTMLCanvasElement>((resolve) => {
    const downloadUrl = window.URL.createObjectURL(new Blob([bytes]));
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, 100, 100);
      resolve(canvas);
    };
    img.src = downloadUrl;
  });

export const generateThumbnailBlobUrl = async (bytes: ArrayBuffer) => {
  const canvas = await generateThumbnailCanvas(bytes);
  return canvas.toDataURL();
};

export const generateThumbnailArrayBuffer = (bytes: ArrayBuffer) =>
  new Promise<ArrayBuffer>(async (resolve, reject) => {
    const canvas = await generateThumbnailCanvas(bytes);
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob.arrayBuffer());
      } else {
        reject();
      }
    });
  });

const config = {
  quality: 0.9,
  width: 100,
  height: 100
};

export const compressImage = async (bytes: ArrayBuffer) => {
  const file = new File([bytes], 'temp');
  const compressedImage = await readAndCompressImage(file, config);
  return compressedImage;
};
