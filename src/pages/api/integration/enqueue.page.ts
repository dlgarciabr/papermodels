/* istanbul ignore file -- @preserve */
import db, { IntegrationItemStatus } from 'db';
import { api } from 'src/blitz-server';
import { JSDOM } from 'jsdom';

import { readPageNodesAsString } from './util';

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const nodesReaded = await readPageNodesAsString(req.body.url, req.body.querySelector);

    const existingNodes = (
      await db.integrationItem.findMany({
        where: {
          node: {
            in: nodesReaded
          }
        },
        select: {
          node: true
        }
      })
    ).map((existingNode) => existingNode.node);

    const sanitizedNodesReaded = nodesReaded.filter(
      (nodeReaded) => !existingNodes.some((existingNode) => nodeReaded === existingNode)
    );

    if (sanitizedNodesReaded.length === 0) {
      res.status(304).send({});
      return;
    }

    await db.integrationItem.createMany({
      data: sanitizedNodesReaded.map((stringNode) => {
        const node = new JSDOM(stringNode);
        const emptyNodes = Array.from(node.window.document.querySelectorAll('*')).filter(
          (node) => node.children.length === 0
        );
        return {
          name: emptyNodes[emptyNodes.length - 1]?.innerHTML || '',
          node: stringNode,
          status: IntegrationItemStatus.feeding
        };
      })
    });
    res.status(200).send({ message: 'success' });
  } else {
    res.status(501).send({});
  }
});
