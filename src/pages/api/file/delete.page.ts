/* istanbul ignore file -- @preserve */
import { api } from 'src/blitz-server';
import { v2 as cloudinary } from 'cloudinary';

export const deleteFile = async (src: string) => {
  cloudinary.config({
    secure: true
  });

  const result = await cloudinary.uploader.destroy(src);

  return result;
};

export default api(async (req, res, _ctx) => {
  if (req.body.src) {
    const result = await deleteFile(req.body.src);
    res.status(200).send(result);
  } else {
    res.status(500).end();
  }
});
