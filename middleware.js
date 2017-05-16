// Generated by CoffeeScript 1.12.6
(function() {
  var init, logger, non_call_logger, uuidV4;

  logger = require('./index');

  this.name = "tangible";

  this.init = init = logger.init;

  non_call_logger = function(suffix, session) {
    var name;
    name = this.__middleware_name;
    if (suffix != null) {
      name += ":" + suffix;
    }
    return this.debug = logger(name, session);
  };

  this.config = function() {
    init(this.cfg);
    return non_call_logger.call(this, 'config');
  };

  this.server_pre = function() {
    init(this.cfg);
    return non_call_logger.call(this, 'server_pre');
  };

  this.web = function() {
    return non_call_logger.call(this, 'web');
  };

  this.notify = function(arg) {
    var socket;
    socket = arg.socket;
    socket.emit('register', {
      event: 'tangile:dev_logger',
      default_room: 'support'
    });
    socket.on('tangible:dev_logger', function(enabled) {
      var dev_logger;
      return dev_logger = enabled;
    });
    socket.emit('register', {
      event: 'tangile:enable',
      default_room: 'support'
    });
    socket.on('tangible:enable', function(namespaces) {
      return logger.Debug.enable(namespaces);
    });
    return non_call_logger.call(this, 'notify');
  };

  uuidV4 = require('uuid/v4');

  this.include = function() {
    var host, id, now, ref, uuid;
    now = Now();
    uuid = uuidV4();
    host = (ref = this.cfg.host) != null ? ref : default_host;
    this.session.logger_stamp = now;
    this.session.logger_host = host;
    this.session.logger_uuid = uuid;
    id = [host, now, uuid].join('-');
    this.session._id = id;
    return non_call_logger.call(this, null, this.session);
  };

}).call(this);