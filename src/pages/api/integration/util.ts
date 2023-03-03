import { JSDOM } from 'jsdom';

//TODO evaluate which function is not being used

export const fetchPageAsString = async (url: string) => {
  const pageContent = await (await fetch(url)).text();
  return pageContent;
};

export const executeSelectorOnHtmlText = (content: string, querySelector: string) => {
  const { window } = new JSDOM(content);
  return window.document.querySelector(querySelector.trim());
};

/**
 * Execute a document.querySelectorAll command on a expecific page received as string
 * using JSDOM
 *
 * @param content The page content to be searched
 * @param querySelector The query selector to be used
 * @returns
 */
export const executeSelectorAllOnHtmlText = (content: string, querySelector: string) => {
  const { window } = new JSDOM(content);
  return window.document.querySelectorAll(querySelector.trim());
};

export const readPageNodesAsString = (pageContent: string, querySelector: string) => {
  const selection = executeSelectorAllOnHtmlText(pageContent, querySelector);
  return Array.from(selection).map((node) => node.outerHTML);
};

export const readPageUrlsFromNodes = (nodesAsString: string[]): string[] => {
  return nodesAsString.map((node) => String(executeSelectorOnHtmlText(node, 'a')?.getAttribute('href')));
};

export const readPageUrls = async (url: string, querySelector: string) => {
  const pageContent = await fetchPageAsString(url);
  const nodes = readPageNodesAsString(pageContent, querySelector);
  return nodes.map((node) => executeSelectorOnHtmlText(node, 'a')?.getAttribute('href'));
};

export const getTextFromNodeAsString = (content: string, querySelector: string) => {
  const node = executeSelectorOnHtmlText(content, querySelector);
  if (node) {
    return node.textContent;
  }
  return null;
};

/**
 * Extract all URLs from a specific domain
 *
 * @param url
 * @param key a key that will be used to filter all url found from site
 * @returns a unique list of URLs
 */
export const getAllSiteUrls = async (url: string, key: string): Promise<string[]> => {
  const allUrls = (await readPageUrls(url, 'a')) as string[];
  const removedNonDomainName = allUrls.filter((link) => !!link && link.toLowerCase().indexOf(key.toLowerCase()) > 0);
  const renamedHttpToHttps = removedNonDomainName.map((url) => url.replace('http://', 'https://'));
  const uniqueUrls = Array.from(new Set(renamedHttpToHttps));
  return uniqueUrls;
};
