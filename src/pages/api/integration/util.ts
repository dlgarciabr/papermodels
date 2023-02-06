import { JSDOM } from 'jsdom';

export const readPageNodes = async (url: string, querySelector: string) => {
  const pageResponse = await fetch(url);
  const pageContent = await pageResponse.text();
  const document = new JSDOM(pageContent);
  const selection = document.window.document.querySelectorAll(querySelector);
  const nodes = Array.from(selection).map((node: any) => ({
    node: node.outerHTML
  }));
  return nodes;
};
