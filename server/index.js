const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const connectMongo = require('connect-mongo')
const throng = require('throng')
const hbs = require('hbs')
const webpack = require('webpack')
const webpackMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')


const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
io.on('connection',  (socket) =>{
  console.log('Connected');
   socket.emit('connected', { hello: 'world' });
});



// configure express server
const configureExpress = () => new Promise((resolve, reject) => {

  const webpackConfig = require('../config/webpack')
  const { NAME } = require('../config/env')
  const { NODE_ENV } = process.env
  const routes = require('./routes')

  // set view engine
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'hbs')
  hbs.registerHelper('json', function (context) { return JSON.stringify(context) })

  // set parsers
  app.use(bodyParser.json({verify:function(req,res,buf){req.rawBody=buf}})) // store rawBody
  app.use(bodyParser.json()) // json string -> {}
  app.use(bodyParser.urlencoded({ extended: false })) // form data -> req.body {}
  app.use(cookieParser()) // cookies string -> req.cookies {}

  // set proxy
  app.enable('trust proxy')

  // logging
  app.use(logger('dev'))

  if (NODE_ENV === 'development') {
    // serve app and website with webpack in development
    const compiler = webpack(webpackConfig)
    const config = {
      hot: true,
      inline: true,
      stats: {
        colors: true,
        hash: false,
        timings: true,
        chunks: false,
        chunkModules: false,
        modules: false
      }
    }

    app.use(webpackMiddleware(compiler, config))

    webpackConfig.map(({ name }) => {
      const opts = { name, dynamicPublicPath: true }
      app.use(webpackHotMiddleware(compiler, opts))
    })
  }

  // setup the routes
  const requireIo = (request, response, next) => {
    console.log('go here');
    response.locals.io = io
    return next()

  }
  const router = express.Router()
  router.use(requireIo)
  app.use('/*',router)
  app.use('/install', routes.install)
  app.use('/billing', routes.billing)
  app.use('/webhook', routes.webhook)
  app.use('/assets', routes.assets)
  app.use('/api', routes.api)
  app.use('/app', routes.app)

  // handle unmatched routes
  app.use((req, res, next) => {
    next({status: 404, message: 'Not Found'})
  })

  // error handling
  app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.send(error.message)
  })

  return resolve()
})

// connect the database
const connectDatabase = () => new Promise((resolve, reject) => {
  const { DATABASE } = require('../config/env')
  mongoose.connect(DATABASE)
  mongoose.Promise = require('bluebird')
  mongoose.connection.on('error', reject)
  mongoose.connection.on('connected', resolve)
})

// start the server
const startServer = () => new Promise((resolve, reject) => {
  //const { Shop } = require('./models')
  //Shop.remove({}).then(() => console.log('removed'))

  const { PORT, NODE_ENV } = require('../config/env')
  const workers = process.env.WEB_CONCURRENCY || 1
  const lifetime = Infinity

  const start = () => {
    app.set('port', PORT)
    server.listen(PORT, () => {
      console.log(`server started at: http://localhost:${PORT}`)
      return resolve()
    })
  }

  if (NODE_ENV === 'development') {
    start()
  } else {
    throng({ workers, lifetime }, start)
  }
})

configureExpress()
.then(connectDatabase)
.then(startServer)
.catch(error => {
  console.log('error starting server: ', error)
})
