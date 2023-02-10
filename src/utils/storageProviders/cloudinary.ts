import { getAntiCSRFToken } from '@blitzjs/auth';
import { Cloudinary } from '@cloudinary/url-gen';
import { name } from '@cloudinary/url-gen/actions/namedTransformation';
import { UploadItemFile } from 'src/items/types';

const getCloudinary = () => {
  return new Cloudinary({
    cloud: {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    }
  });
};

const getFileUrl = (path: string) => {
  return getCloudinary().image(path.split('.')[0]).toURL();
};

const getThumbnailUrl = (path: string) => {
  const transformation = name('papermodel_thumbnail');
  const image = getCloudinary().image(path.split('.')[0]).namedTransformation(transformation);
  return image.toURL();
};

export const saveFile = async (file: UploadItemFile) => {
  if (file.bytes) {
    const bytesAsBase64 = Buffer.from(file.bytes).toString('base64');
    const url = `data:image/jpeg;base64,${bytesAsBase64}`;
    const antiCSRFToken = getAntiCSRFToken();
    const response = await fetch(`${location.origin}/api/upload/image`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'anti-csrf': antiCSRFToken
      },
      body: JSON.stringify({ src: url })
    });
    const result = await response.json();
    return result;
  }
  throw new Error('parameter contains no bytes');
};

const cloudinary = {
  getFileUrl,
  getThumbnailUrl,
  saveFile
};

export default cloudinary;
