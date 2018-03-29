const app = require('./webpack.app.js')
const site = require('./webpack.site.js')
const script = require('./webpack.script.js')

module.exports = [
  app,
  site,
  script
]