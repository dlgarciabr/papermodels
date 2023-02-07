import { JSDOM } from 'jsdom';

export const fetchPageAsString = async (url: string) => {
  const pageResponse = await fetch(url);
  const pageContent = await pageResponse.text();
  return pageContent;
};

export const executeSelectorOnHtmlText = (content: string, querySelector: string) => {
  const { window } = new JSDOM(content);
  return window.document.querySelector(querySelector);
};

export const executeSelectorAllOnHtmlText = (content: string, querySelector: string) => {
  const { window } = new JSDOM(content);
  return window.document.querySelectorAll(querySelector);
};

export const readPageNodesAsString = async (url: string, querySelector: string) => {
  const pageContent = await fetchPageAsString(url);
  const selection = executeSelectorAllOnHtmlText(pageContent, querySelector);
  return Array.from(selection).map((node: Element) => node.outerHTML);
};

export const readPageUrlsFromNodes = (nodesAsString: string[]) => {
  return nodesAsString.map((node) => executeSelectorOnHtmlText(node, 'a')?.getAttribute('href'));
};

export const readPageUrls = async (url: string, querySelector: string) => {
  const nodes = await readPageNodesAsString(url, querySelector);
  return nodes.map((node) => executeSelectorOnHtmlText(node, 'a')?.getAttribute('href'));
};

export const getTextFromNodeAsString = (content: string, querySelector: string) => {
  const node = executeSelectorOnHtmlText(content, querySelector);
  if (node) {
    return node.textContent;
  }
  return null;
};
