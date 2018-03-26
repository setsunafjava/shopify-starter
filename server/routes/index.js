const install = require('./install');
const app = require('./app');
const api = require('./api');
const proxy = require('./proxy');
const webhook = require('./webhook');
const assets = require('./assets');

module.exports = { api, app, install, proxy, webhook, assets };
