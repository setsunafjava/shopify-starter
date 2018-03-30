const crypto = require('crypto');
const { SHOPIFY_API_SECRET } = require('../../config/env');

const verifyHmac = (request, response, next) => {
  const useHeader = !!request.get('X-Shopify-Hmac-SHA256');
  const hmac = useHeader ? request.get('X-Shopify-Hmac-SHA256') : request.query.hmac || request.query.signature;
  const data = useHeader ? request.rawBody : Object.keys(request.query)
    .filter(key => key !== 'hmac' && key !== 'charge_id' && key !== 'signature')
    .map(key => `${key}=${Array(request.query[key]).join(',')}`)
    .sort().join(request.query.signature ? '' : '&');

  const digest = useHeader ? 'base64' : 'hex';
  const generatedHmac = crypto.createHmac('sha256', SHOPIFY_API_SECRET).update(data).digest(digest);


  if (hmac === generatedHmac) {
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.header("Access-Control-Allow-Origin", '*');
    return next();
  }

  

  return next({status: 403, message: 'Invalid hmac'});
}

module.exports = verifyHmac;
