// @ts-check
const { withBlitz } = require('@blitzjs/next');

/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
const config = {
  pageExtensions: ['page.tsx', 'page.ts'],
  images: {
    domains: ['firebasestorage.googleapis.com']
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap'
      }
    ];
  }
};

module.exports = withBlitz(config);
