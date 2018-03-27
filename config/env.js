const env = Object.assign({
  NAME: 'Shopify Embedded Starter',
  PORT: 3000,
  DATABASE: 'mongodb://localhost/shopify-embedded-starter-app',
  URL: 'https://29212100.ngrok.io',
  APPLICATION_CHARGE: 0,
  RECURRING_APPLICATION_CHARGE: 0,
  FREE_TRIAL: 0,
  SHOPIFY_API_KEY: '016892c950d22bca02ff9632e6aff5e7',
  SHOPIFY_API_SECRET: 'b07d9cce8948aef0ae852cd19fa670da',
  SHOPIFY_APP_SCOPE: 'write_script_tags',
  LIVECHAT_API_KEY: 9552120,
  NODE_ENV: process.env.NODE_ENV,
}, process.env)

module.exports = env;
