// next-sitemap.config.js

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://papermodels.vercel.app',
  generateRobotsTxt: true,
  exclude: ['/sitemap.xml', '/api/sitemap'] // <= exclude here
};
