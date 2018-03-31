const crypto = require('crypto')
const { SHOPIFY_API_SECRET } = require('../../config/env')

// calculates and verifies hmac messages sent along with requests
// from various shopify and application routes
// also allows cross origin domain requests if the originating host
// matches the shop provided in the hmac validation params
const verifyHmac = (request, response, next) => {
  const useHeader = !!request.get('X-Shopify-Hmac-SHA256')
  const ignoreKeys = [ 'hmac', 'charge_id', 'signature', 'redirect' ]
  const hmac = useHeader ? request.get('X-Shopify-Hmac-SHA256') : request.query.hmac || request.query.signature
  const data = useHeader ? request.rawBody : Object.keys(request.query)
    .filter(key => ignoreKeys.indexOf(key) < 0)
    .map(key => `${key}=${Array(request.query[key]).join(',')}`)
    .sort().join(request.query.signature ? '' : '&')

  const digest = useHeader ? 'base64' : 'hex'
  const generatedHmac = crypto.createHmac('sha256', SHOPIFY_API_SECRET).update(data).digest(digest)

  if (hmac === generatedHmac) {
    // if the request origin is the same as the shop domain
    // it's likely script-tag so setup for CORS requests
    const origin = request.headers.origin
    const shop = request.query.shop || request.get('X-Shopify-Shop-Domain')
    if (`https://${shop}` === origin) {
      response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      response.header("Access-Control-Allow-Origin", origin)
    }

    // authorized, go to next route
    return next()
  }

  // unauthorized throw an error
  return next({status: 403, message: 'Invalid hmac'})
}

module.exports = verifyHmac
