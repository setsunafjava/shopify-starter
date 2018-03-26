const env = Object.assign({
  NAME: 'Shopify Embedded Starter',
  PORT: 3000,
  URL: 'https://f5e2225a.ngrok.io',
  DATABASE: 'mongodb://localhost/app',
  SHOPIFY_API_KEY: '016892c950d22bca02ff9632e6aff5e7',
  SHOPIFY_API_SECRET: 'b07d9cce8948aef0ae852cd19fa670da',
  SHOPIFY_APP_SCOPE: 'write_script_tags',
  LIVECHAT_API_KEY: 9552120,
  NODE_ENV: process.env.NODE_ENV,
}, process.env)

module.exports = env;
