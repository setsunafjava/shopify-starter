const env = Object.assign({
  NAME: 'Shopify Embedded PEX Starter',
  PORT: 8086,
  DATABASE: 'mongodb://abc:123@54.169.153.46:27017/test',
  URL: 'http://54.169.153.46:8086',
  SHOPIFY_API_KEY: 'e0ca39c53d7380d71549c3f9af595cf9',
  SHOPIFY_API_SECRET: 'ef19134c8c2793da25b4241476511113',
  SHOPIFY_APP_SCOPE: [
    'write_script_tags'
  ],
  LIVECHAT_API_KEY: 9701140,
  APPLICATION_CHARGE: true,
  RECURRING_CHARGE: true,
  FREE_TRIAL_DURATION: 3,
  TEST_BILLING: true,
  DEFAULT_SETTINGS: {
    enabled: true,
  }
}, process.env)

module.exports = env;
