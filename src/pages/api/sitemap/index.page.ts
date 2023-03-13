import db, { ItemStatus } from 'db';
import { getServerSideSitemap } from 'next-sitemap';
import { api } from 'src/blitz-server';

export default api(async (_req, res, _ctx) => {
  console.log(`[SitemapGenerator] ${new Date().toISOString()} - Sitemap generation process started.`);
  try {
    const enabledItems = await db.item.findMany({
      where: {
        status: ItemStatus.enable
      }
    });
    const urls = enabledItems.map((item) => ({
      loc: `${process.env.SITE_URL}/items/${item.id}`,
      lastmod: new Date().toISOString()
    }));
    urls.splice(0, 0, {
      loc: `${process.env.SITE_URL}`,
      lastmod: new Date().toISOString()
    });
    const siteMapResponse = await getServerSideSitemap(urls);
    console.log(`[SitemapGenerator] ${new Date().toISOString()} - Sitemap generation process finished.`);
    res.setHeader('Content-Type', 'text/xml').status(siteMapResponse.status).send(siteMapResponse.body);
  } catch (error) {
    console.log(`[SitemapGenerator] ${new Date().toISOString()} - Sitemap generation process finished with error.`);
    res.status(500).send({ ...error });
  }
});
