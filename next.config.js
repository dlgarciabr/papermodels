// @ts-check
const { withBlitz } = require('@blitzjs/next');

const rulesToProcess = [/\.(tsx|ts|js|cjs|mjs|jsx)$/].map(String);
const fileToIgnore = '/src/pages/index.test.tsx';
/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
const config = {
  // webpack: (config) => {
  //   config.module.rules = config.module.rules.map((rule) => {
  //     if (rule.oneOf) {
  //       rule.oneOf.forEach((subRule) => {
  //         if (rulesToProcess.indexOf(String(subRule.test)) > -1) {
  //           console.log('subRule.exclude####################', subRule)
  //           subRule.exclude = [fileToIgnore];
  //           console.log('subRule.exclude####################', subRule.exclude)
  //         }
  //       })
  //     }
  //     return rule;
  //   });
  //   return config;
  // }
};

module.exports = withBlitz(config);
