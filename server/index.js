const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const connectMongo = require('connect-mongo');
const throng = require('throng');
const hbs = require('hbs');
const MongoStore = connectMongo(session);
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const app = express();

// configure express server
const configureExpress = () => {
  return new Promise((resolve, reject) => {
    const webpackConfig = require('../config/webpack')
    const { NAME, NODE_ENV } = require('../config/env')
    const routes = require('./routes')

    // set view engine
    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'hbs')
    hbs.registerHelper('json', function (context) { return JSON.stringify(context) })

    // set favicon
    app.use(favicon(path.join(__dirname, '../', 'assets', 'favicon.ico')))

    // set parsers
    app.use(bodyParser.json({verify:function(req,res,buf){req.rawBody=buf}})) // store rawBody
    app.use(bodyParser.json()) // json string -> {}
    app.use(bodyParser.urlencoded({ extended: false })) // form data -> req.body {}
    app.use(cookieParser()) // cookies string -> req.cookies {}

    // set proxy
    app.enable('trust proxy')

    // set sessions
    //app.use(session({
      //NAME,
      //secret: process.env.SESSION_SECRET || 'development_session_secret',
      //cookie: { secure: true, maxAge: (24 * 60 * 60 * 1000) },
      //saveUninitialized: true,
      //resave: false,
      //store: new MongoStore({ mongooseConnection: mongoose.connection }),
    //}))

    // logging
    app.use(logger('dev'));

    // serve client (react) with webpack in development
    if (NODE_ENV === 'development') {
      const compiler = webpack(webpackConfig);
      const middleware = webpackMiddleware(compiler, {
        hot: true,
        inline: true,
        publicPath: webpackConfig.output.publicPath,
        contentBase: path.resolve(__dirname, '../assets'),
        stats: {
          colors: true,
          hash: false,
          timings: true,
          chunks: false,
          chunkModules: false,
          modules: false,
        },
      });
      app.use(middleware);
      app.use(webpackHotMiddleware(compiler));
    }

    // routes
    app.use('/install', routes.install);
    app.use('/webhook', routes.webhook);
    app.use('/proxy', routes.proxy);
    app.use('/assets', routes.assets);
    app.use('/api', routes.api);
    app.use('/', routes.app);

    // 404
    app.use((req, res, next) => {
      next({status: 404, message: 'Not Found'})
    });

    // error handling
    app.use((error, req, res, next) => {
      const { NODE_ENV } = require('../config/env')
      if (req.headers['accept'] === 'application/json') {
        // return an error json
        if (NODE_ENV !== 'development') delete error.stack;
        res.status(error.statusCode || 500).send(error);
      } else {
        // render the error page
        res.status(error.status || 500);
        res.render('error', { 
          message: error.message,
          error: NODE_ENV === 'development' ? error : {},
        });
      }
    });

    return resolve()
  })
}

// configure database
const connectDatabase = () => {
  return new Promise((resolve, reject) => {
    const { DATABASE } = require('../config/env')
    mongoose.connect(DATABASE)
    mongoose.Promise = require('bluebird')
    mongoose.connection.on('error', reject)
    mongoose.connection.on('connected', resolve)
  })
}

// start the server
const startServer = () => {
  return new Promise((resolve, reject) => {
    const { PORT, NODE_ENV } = require('../config/env')
    const workers = process.env.WEB_CONCURRENCY || 1
    const lifetime = Infinity
    const start = () => {
      app.set('port', PORT);
      app.listen(PORT, () => {
        console.log(`server started at: http://localhost:${PORT}`)
        return resolve()
      })
    }
    if (NODE_ENV === 'development') start()
    else throng({ workers, lifetime }, start)
  })
}

configureExpress()
.then(connectDatabase)
.then(startServer)
.catch(error => {
  console.log('error: ', error);
})