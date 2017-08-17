// Generated by CoffeeScript 1.12.5
(function() {
  var Now, init, logger, repl, uuidV4;

  logger = require('./index').use(require('./cuddly')).use(require('./gelf')).use(require('./redis')).use(require('./net'));

  repl = require('./repl');

  Now = function() {
    return new Date().toJSON();
  };

  this.name = "tangible";

  init = function(cfg) {
    if (cfg.dev_logger != null) {
      logger.set_dev_logger(cfg.dev_logger);
    }
    if (cfg.host != null) {
      return logger.default_host = cfg.host;
    }
  };

  this.config = function() {
    init(this.cfg);
    return this.debug = logger(null, 'config');
  };

  this.server_pre = function() {
    init(this.cfg);
    logger.use(repl(this));
    return this.debug = logger(null, 'server_pre');
  };

  this.web = function() {
    return this.debug = logger(null, 'web');
  };

  this.notify = function(arg) {
    var socket;
    socket = arg.socket;
    socket.emit('register', {
      event: 'tangible:dev_logger',
      default_room: 'support'
    });
    socket.on('tangible:dev_logger', function(enabled) {
      return logger.set_dev_logger(enabled);
    });
    socket.emit('register', {
      event: 'tangible:enable',
      default_room: 'support'
    });
    socket.on('tangible:enable', function(namespaces) {
      return logger.enable(namespaces);
    });
    return this.debug = logger(null, 'notify');
  };

  uuidV4 = require('uuid/v4');

  this.include = function() {
    var host, id, now, ref, uuid;
    now = Now();
    uuid = uuidV4();
    host = (ref = this.cfg.host) != null ? ref : logger.default_host;
    this.session.logger_stamp = now;
    this.session.logger_host = host;
    this.session.logger_uuid = uuid;
    id = [host, now, uuid].join('-');
    this.session._id = id;
    return this.debug = logger.call(this);
  };

}).call(this);
