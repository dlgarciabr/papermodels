/* istanbul ignore file -- @preserve */
import { api } from 'src/blitz-server';

export const uploadPdf = async (_src: string) => {
  // TODO
  // cloudinary.config({
  //   secure: true
  // });
  // const options: UploadApiOptions = {
  //   folder: 'papermodel_test',
  //   unique_filename: true,
  //   transformation: ["papermodel_adjust_fit"], //TODO modify to have more control over transformations,
  //   // eager: ['t_papermodel_thumbnail']
  // };
  // const result = await cloudinary.uploader.upload(src, options);
  // return result;
};

export default api(async (req, res, _ctx) => {
  if (req.body.src) {
    const response = await uploadPdf(req.body.src);
    res.status(200).send(response);
  } else {
    res.status(500).end();
  }
});
