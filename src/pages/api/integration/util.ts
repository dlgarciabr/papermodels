import { JSDOM } from 'jsdom';

export const fetchPageAsString = async (url: string) => {
  const pageResponse = await fetch(url);
  const pageContent = await pageResponse.text();
  return pageContent;
};

export const executeSelectorOnHtmlText = (content: string, querySelector: string) => {
  const document = new JSDOM(content);
  const selection = document.window.document.querySelectorAll(querySelector);
  return selection;
};

export const readPageNodesAsString = async (url: string, querySelector: string) => {
  const pageContent = await fetchPageAsString(url);
  const selection = executeSelectorOnHtmlText(pageContent, querySelector);
  const nodes = Array.from(selection).map((node: Element) => node.outerHTML);
  return nodes;
};
