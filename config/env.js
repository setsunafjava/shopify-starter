const env = Object.assign({
  NAME: 'Shopify Embedded PEX Starter',
  PORT: 8080,
  DATABASE: 'mongodb://root:1@cluster0-shard-00-00-dyso2.mongodb.net:27017,cluster0-shard-00-01-dyso2.mongodb.net:27017,cluster0-shard-00-02-dyso2.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',
  URL: 'https://shopify-starter-datvt4.c9users.io',
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
