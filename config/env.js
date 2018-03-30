const env = Object.assign({
  NAME: 'Shopify Embedded Starter',
  PORT: 3000,
  DATABASE: 'mongodb://localhost/shopify-embedded-starter-app',
  URL: 'https://7ef783d2.ngrok.io',
  SHOPIFY_API_KEY: '016892c950d22bca02ff9632e6aff5e7',
  SHOPIFY_API_SECRET: 'b07d9cce8948aef0ae852cd19fa670da',
  SHOPIFY_APP_SCOPE: 'write_script_tags',
  LIVECHAT_API_KEY: 9552120,
  APPLICATION_CHARGE: '10.00',
  RECURRING_CHARGE: true,
  FREE_TRIAL_DURATION: 0,
  DEFAULT_SETTINGS: {
    enabled: true,
    color: true,
  },
  NODE_ENV: process.env.NODE_ENV
}, process.env)

module.exports = env;
