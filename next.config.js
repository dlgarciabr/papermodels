// @ts-check
const { withBlitz } = require('@blitzjs/next');

/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
const config = {
  pageExtensions: ['page.tsx', 'page.ts']
};

module.exports = withBlitz(config);
