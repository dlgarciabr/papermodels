import { Cloudinary } from '@cloudinary/url-gen';
import { name } from '@cloudinary/url-gen/actions/namedTransformation';

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

const cloudinary = {
  getFileUrl,
  getThumbnailUrl
};

export default cloudinary;
