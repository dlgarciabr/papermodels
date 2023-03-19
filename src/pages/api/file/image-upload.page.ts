/* istanbul ignore file -- @preserve */
import { api } from 'src/blitz-server';
import { UploadApiOptions, v2 as cloudinary } from 'cloudinary';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb'
    }
  }
};

export const uploadImage = async (src: string, path: string) => {
  cloudinary.config({
    secure: true
  });
  const options: UploadApiOptions = {
    folder: path,
    unique_filename: true,
    transformation: ['papermodel_adjust_fit']
  };
  console.log('[FileUploader] Uploading file to Cloudinary...');
  const result = await cloudinary.uploader.upload(src, options);
  return result;
};

export default api(async (req, res, _ctx) => {
  if (req.body.src) {
    try {
      const result = await uploadImage(req.body.src, req.body.path);
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send({ ...error });
    }
  } else {
    res.status(500).end();
  }
});
