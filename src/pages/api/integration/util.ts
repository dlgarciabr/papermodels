import { JSDOM } from 'jsdom';
import { IntegrationSelector } from 'types';

export const fetchPageAsString = async (url: string) => {
  const pageContent = await (await fetch(url)).text();
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

export const readPageNodesAsString = (pageContent: string, querySelector: string) => {
  const selection = executeSelectorAllOnHtmlText(pageContent, querySelector);
  return Array.from(selection).map((node) => node.outerHTML);
};

export const readPageUrlsFromNodes = (nodesAsString: string[]) => {
  return nodesAsString.map((node) => executeSelectorOnHtmlText(node, 'a')?.getAttribute('href'));
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

export const getAllSiteUrls = async (url: string, domainName: string): Promise<string[]> => {
  let siteSanitizedUrls: string[] = [];

  const allLinks = (await readPageUrls(url, 'a')) as string[];

  const removedNonDomainName = allLinks.filter(
    (link) => !!link && link.toLowerCase().indexOf(domainName.toLowerCase()) > 0
  );
  const uniqueLinks = Array.from(new Set(removedNonDomainName));

  siteSanitizedUrls = [...uniqueLinks];

  return siteSanitizedUrls;
};

export const getItemUrlsFromPage = async (pageUrl: string, selectors: IntegrationSelector[]): Promise<string[]> => {
  let pageUrls: string[] = [];

  for await (const selector of selectors) {
    const urls = (await readPageUrls(pageUrl, selector.value)) as string[];
    pageUrls = [...pageUrls, ...urls];
  }

  return pageUrls;
};
