/* istanbul ignore file -- @preserve */
import db, { IntegrationItemStatus } from 'db';
import { api } from 'src/blitz-server';
import { JSDOM } from 'jsdom';

import { readPageNodesAsString } from './util';

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const originalNodes = await readPageNodesAsString(req.body.url, req.body.querySelector);

    const existingNodes = (
      await db.integrationItem.findMany({
        where: {
          node: {
            in: originalNodes
          }
        },
        select: {
          node: true
        }
      })
    ).map((existingNode) => existingNode.node);

    let sanitizedNodes: string[];

    if (existingNodes.length === 0) {
      sanitizedNodes = [...originalNodes];
    } else {
      sanitizedNodes = originalNodes.filter(
        (nodeReaded) => !existingNodes.some((existingNode) => nodeReaded === existingNode)
      );
    }

    if (sanitizedNodes.length === 0) {
      res.status(304).send({});
      return;
    }

    await db.integrationItem.createMany({
      data: sanitizedNodes.map((stringNode) => {
        const node = new JSDOM(stringNode);
        const emptyNodes = Array.from(node.window.document.querySelectorAll('*')).filter(
          (node) => node.children.length === 0
        );
        return {
          name: emptyNodes[emptyNodes.length - 1]?.innerHTML || '',
          node: stringNode,
          status: IntegrationItemStatus.pending
        };
      })
    });
    res.status(200).send({ message: 'success' });
  } else {
    res.status(501).send({});
  }
});
