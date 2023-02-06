import { JSDOM } from 'jsdom';

export const readPageNodesAsString = async (url: string, querySelector: string) => {
  const pageResponse = await fetch(url);
  const pageContent = await pageResponse.text();
  const document = new JSDOM(pageContent);
  const selection = document.window.document.querySelectorAll(querySelector);
  const nodes = Array.from(selection).map((node: Element) => node.outerHTML);
  return nodes;
};
