import db, { ItemStatus } from 'db';
import { getServerSideSitemap } from 'next-sitemap';
import { api } from 'src/blitz-server';
import path from 'path';
import fs from 'fs';

export default api(async (_req, res, _ctx) => {
  console.log(`[SitemapGenerator] ${new Date().toISOString()} - Sitemap generation process started.`);
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
  const buffer = await (await siteMapResponse.blob()).arrayBuffer();
  const filePath = `${path.resolve('./public')}/sitemap.xml`;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  fs.appendFileSync(filePath, Buffer.from(buffer));
  console.log(`[SitemapGenerator] ${new Date().toISOString()} - Sitemap generation process finished.`);
  res.status(200).end();
});
