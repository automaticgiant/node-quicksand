const express = require('express');
const path = require('path');

const fs = require('fs');

const debug = require('debug');

function Quicksand(config) {
  this.config = config;
  this.app = express();

  const app = this.app;
  debug('quicksand:base')('configured with ', config);

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');

  app.use(require('body-parser').raw());

  app.delete('/:file', function (req, res) {
    debug('quicksand:delete')('requested delete ' + req.path);
    fs.unlink(path.join(config.storeLocation, req.params.file));
    res.status(200);
    res.send('accepted');
  });
  app.put('/:file', function (req, res) {
    debug('quicksand:put')('requested put ' + req.path);
    if (req.body instanceof Buffer) {
      fs.writeFileSync(path.join(config.storeLocation, req.params.file), req.body, null);
      res.status(200);
      res.send('accepted');
    }
    else {
      res.status(500);
      res.send('could not get body, maybe not octet-stream specified?');
    }
  }
    )
    ;
  app.use(express.static(path.join(__dirname, 'public')));
  const serveIndex = require('serve-index');
  app.use('/', serveIndex(config.storeLocation, {
    icons: true,
    view: 'details'
  }));
  app.use(express.static(config.storeLocation));


// catch 404 and forward to errorhandler
  app.use(function (req, res, next) {
    var err = new Error('404: Not Found');
    err.status = 404;
    debug('quicksand:base')('error on', req.path);
    next(err);
  });

// error handlers

// development error handler
// will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function (err, req, res) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

// production error handler
// no stacktraces leaked to user
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });

    // set up store watch for change
    // on change
    // get dir size
    // compare to max size
    // if greater
    //   see if most recent is greater
    //     yes, delete all but
    //     no, delete dirsize-maxsize worth of oldest files

    // set up timer to check for aged out files every minute
    // walk dir
    //   if current now - agemax > creation time
    //      delete
  setInterval(function timedExpiry(){
    const walker = require('walk').walk(config.storeLocation, {followLinks: false});
    walker.on('file', function(root, fileStat, next){
      if (new Date() - config.ageMax > fileStat.ctime) {
        debug('quicksand:timedExpiry')(fileStat.name + ':' + fileStat.ctime + ' expired, deleting');
        fs.unlink(path.resolve(root, fileStat.name));
      }
      next();
    });
  }, config.pollFrequency);
}

module.exports = Quicksand;
