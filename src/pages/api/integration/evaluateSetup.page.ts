/* istanbul ignore file -- @preserve */
import { IntegrationSetup } from '@prisma/client';
import { api } from 'src/blitz-server';
import { IntegrationSelector } from 'types';
import { IError } from './types';
import { fetchPageAsString, getAllSiteUrls, getItemUrlsFromPage } from './util';

/**
 * @deprecated
 */
export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const errors: IError[] = [];
    let itemUrls: any[] = [];
    const setup = req.body as IntegrationSetup;

    try {
      const _pageContent = await fetchPageAsString(setup.domain);

      let itemUrlSelectors: IntegrationSelector[] = [];
      try {
        const selectors = JSON.parse(req.body.itemUrlSelector);
        itemUrlSelectors = selectors;
      } catch (error) {
        throw {
          ...JSON.parse(JSON.stringify(error)),
          reference: 'selector: Item url selector',
          value: req.body.itemUrlSelector
        };
      }

      const siteSanitizedUrls = await getAllSiteUrls(setup.domain, setup.name);

      for await (const url of siteSanitizedUrls.slice(0, siteSanitizedUrls.length / 10)) {
        const urls = await getItemUrlsFromPage(url, itemUrlSelectors);
        itemUrls = [...itemUrls, ...urls];
      }

      itemUrls = Array.from(new Set(itemUrls));

      // for await (const urlSelector of itemUrlSelectors) {
      //   const urls = await readPageUrls(req.body.domain, urlSelector.value);
      //   if (urls.length === 0) {
      //     throw {
      //       reference: 'selector: Item url selector',
      //       value: urlSelector.value
      //     }
      //   }
      //   itemUrls = [...itemUrls, ...urls];
      // }

      // TODO evaluate first page images
    } catch (error) {
      errors.push({
        ...JSON.parse(JSON.stringify(error)),
        reference: error.reference ? error.reference : `domain: ${req.body.domain}`
      });
    }

    if (errors.length > 0) {
      res.status(200).send({ errors });
      return;
    }

    res.status(200).send(itemUrls);
  } else {
    res.status(501).send({});
  }
});
