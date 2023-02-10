/* istanbul ignore file -- @preserve */
import { api } from 'src/blitz-server';
import { UploadApiOptions, v2 as cloudinary } from 'cloudinary';

export const uploadImage = async (src: string) => {
  cloudinary.config({
    secure: true
  });
  const options: UploadApiOptions = {
    folder: 'papermodel_test',
    unique_filename: true,
    transformation: ['papermodel_adjust_fit'] //TODO modify to have more control over transformations,
    // eager: ['t_papermodel_thumbnail']
  };
  const result = await cloudinary.uploader.upload(src, options);
  return result;
};

export default api(async (req, res, _ctx) => {
  if (req.body.src) {
    const result = await uploadImage(req.body.src);
    res.status(200).send(result);
  } else {
    res.status(500).end();
  }
});
