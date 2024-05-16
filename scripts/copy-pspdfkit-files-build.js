const ncp = require('ncp').ncp;

ncp('./node_modules/pspdfkit/dist/pspdfkit-lib', './build/static/js/pspdfkit-lib', (err) => {
  err && console.error(err);
});
