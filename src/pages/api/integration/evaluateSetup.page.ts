/* istanbul ignore file -- @preserve */
import { api } from 'src/blitz-server';
import { readPageNodesAsString } from './util';

// TODO
// const ignoredExpressions = [
//   'drive.google.com'
// ]

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const nodes = await readPageNodesAsString(req.body.url, req.body.querySelector);
    res.status(200).send(nodes);
  } else {
    res.status(501).send({});
  }
});
