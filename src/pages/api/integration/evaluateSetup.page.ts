/* istanbul ignore file -- @preserve */
import { api } from 'src/blitz-server';
import { readPageNodes } from './util';

// TODO
// const ignoredExpressions = [
//   'drive.google.com'
// ]

// const readPageItemList = async (url: string, querySelector: string) => {
//   const pageResponse = await fetch(url);
//   const pageContent = await pageResponse.text();
//   const document = new JSDOM(pageContent);
//   const selection = document.window.document.querySelectorAll(querySelector);
//   const result = Array.from(selection).map((node: any) => ({
//     node: node.outerHTML,
//   }));
//   return result;
// }

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const nodes = await readPageNodes(req.body.url, req.body.querySelector);
    res.status(200).send(nodes);
  } else {
    res.status(501).send({});
  }
});
