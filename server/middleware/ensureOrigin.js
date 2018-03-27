const ensureOrigin = (request, response, next) => {
  const { shop } = response.locals
  const origin = request.headers.origin || request.headers.referer
  console.log('origin', origin)
  if (origin.indexOf(`https://${shop.domain}.myshopify.com`) !== 0) {
    return next({state: 403, message: 'invalid origin'})
  }
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  response.header("Access-Control-Allow-Origin", origin);
  return next()
}

module.exports = ensureOrigin;