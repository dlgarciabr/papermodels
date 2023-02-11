/* istanbul ignore file -- @preserve */
import { api } from 'src/blitz-server';
import { readPageUrls } from './util';

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    try {
      const nodes = await readPageUrls(req.body.url, req.body.querySelector);
      res.status(200).send(nodes);
    } catch (error) {
      res.status(200).send({ error: error.message });
    }
  } else {
    res.status(501).send({});
  }
});
