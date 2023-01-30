// @ts-check
const { withBlitz } = require('@blitzjs/next');

/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
const config = {
  pageExtensions: ['page.tsx', 'page.ts'],
  images: {
    domains: ['firebasestorage.googleapis.com']
  }
};

module.exports = withBlitz(config);
