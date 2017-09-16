const finalhandler = require('finalhandler')
const http = require('http')
const serveIndex = require('serve-index')
const serveStatic = require('serve-static')

module.exports = function (target) {
  const targetPath = target.file ? `${target.dir}/${target.file}` : target.dir
  const indexServer = serveIndex(target.dir, {
    'icons': true,
    'view': 'details'
  })
  const staticServer = serveStatic(target.dir, {
    'index': false,
    'setHeaders': setHeaders
  })

  function setHeaders (res, path) {
    res.setHeader('Access-Control-Allow-Headers', 'cache-control, content-type, expires, location, origin, pragma, x-http-method-override, x-requested-with'),
    res.setHeader('Access-Control-Allow-Origin', '*'),
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'),
    res.setHeader('Cache-Control', 'must-revalidate, no-cache, no-store, private'),
    res.setHeader('Expires', '-1'),
    res.setHeader('Pragma', 'no-cache')
  }

  http.createServer(function onRequest (req, res){
    const done = finalhandler(req, res)
    staticServer(req, res, function onNext (err) {
      if (err) return done(err)
      indexServer(req, res, done)
    })
  }).listen(12345, '0.0.0.0', () => {
    console.log(`\u2693 Serving ${targetPath}`)
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Cannot start server (port 12345 is already in use)`)
    }
    process.exit(1)
  })

  return target.url
}
