import db, { ItemStatus } from 'db';
import { getServerSideSitemap } from 'next-sitemap';
import { api } from 'src/blitz-server';

export default api(async (_req, res, _ctx) => {
  const now = new Date().toISOString();
  console.log(`[SitemapGenerator] ${now} - Sitemap generation process started.`);
  try {
    const enabledItems = await db.item.findMany({
      where: {
        status: ItemStatus.enable
      }
    });
    console.log(`[SitemapGenerator] found ${enabledItems.length} items.`);
    const urls = enabledItems.map((item) => ({
      loc: `${process.env.SITE_URL}/items/${item.id}`,
      lastmod: now
    }));
    urls.splice(0, 0, {
      loc: `${process.env.SITE_URL}`,
      lastmod: now
    });
    const siteMapResponse = await getServerSideSitemap(urls);
    console.log('###################################################################');
    const t = await siteMapResponse.text();
    console.log(t);
    console.log('###################################################################');
    console.log(`[SitemapGenerator] ${now} - Sitemap generation process finished.`);
    res
      .setHeader('Content-Type', 'text/xml')
      .setHeader('Cache-control', 'stale-while-revalidate, s-maxage=3600')
      .status(siteMapResponse.status)
      .send(siteMapResponse.body);
  } catch (error) {
    console.log(`[SitemapGenerator] ${now} - Sitemap generation process finished with error.`);
    res.status(500).send({ ...error });
  }
});
