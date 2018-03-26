const crypto = require('crypto');
const { SHOPIFY_API_SECRET } = require('../../config/env');

const verifyHmac = (request, response, next) => {
  const useHeader = !!request.get('X-Shopify-Hmac-SHA256');
  const hmac = useHeader ? request.get('X-Shopify-Hmac-SHA256') : request.query.hmac;
  const data = useHeader ? request.rawBody : Object.keys(request.query)
    .filter(key => key !== 'hmac')
    .map(key => `${key}=${Array(request.query[key]).join(',')}`)
    .sort().join('&');
  const digest = useHeader ? 'base64' : 'hex';
  const generatedHmac = crypto.createHmac('sha256', SHOPIFY_API_SECRET).update(data).digest(digest);

  if (hmac === generatedHmac) {
    return next();
  }

  return next({status: 403, message: 'Invalid hmac'});
}

module.exports = verifyHmac;
