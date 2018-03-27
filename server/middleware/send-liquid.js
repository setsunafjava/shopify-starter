const sendLiquid = (request, response, next) => {
  res.set('Content-Type', 'application/liquid');
  return next();
}

module.exports = sendLiquid;