// Generated by CoffeeScript 1.12.6
(function() {
  var Debug, IO, Now, __debug, cuddly_io, cuddly_url, default_host, dev_logger, events, fs, gelf_config, k, logger, map, n, os, ref, request,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    hasProp = {}.hasOwnProperty;

  Debug = require('debug');

  IO = require('socket.io-client');

  request = require('superagent');

  __debug = Debug('tangible');

  events = ['dev', 'ops', 'csr'];

  os = require('os');

  fs = require('fs');

  default_host = (ref = process.env.CUDDLY_HOST) != null ? ref : os.hostname();

  cuddly_url = process.env.CUDDLY_URL;

  cuddly_io = null;

  gelf_config = null;

  if (process.env.GELF_URL != null) {
    map = {
      key: 'GELF_KEY',
      cert: 'GELF_CERT',
      ca: 'GELF_CA'
    };
    gelf_config = {
      url: process.env.GELF_URL
    };
    for (k in map) {
      n = map[k];
      if (n in process.env) {
        gelf_config[k] = fs.readFileSync(process.env[n]);
      }
    }
  }

  dev_logger = true;

  if (process.env.DEV_LOGGER === 'true') {
    dev_logger = true;
  }

  if (process.env.DEV_LOGGER === 'false') {
    dev_logger = false;
  }

  Now = function() {
    return new Date().toJSON();
  };

  module.exports = logger = function(name, session) {
    var debug, make_debug;
    make_debug = (function(_this) {
      return function(e) {
        var _debug, event;
        event = "report_" + e;
        _debug = Debug(name + ":" + e);
        return function() {
          var arg, args, data, extra, host, message, now, ref1, ref2, ref3, ref4, ref5, ref6, ref7, text, v;
          text = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          arg = args[0], extra = 2 <= args.length ? slice.call(args, 1) : [];
          now = (ref1 = (ref2 = _this.session) != null ? ref2.logger_stamp : void 0) != null ? ref1 : Now();
          host = (ref3 = (ref4 = _this.session) != null ? ref4.logger_host : void 0) != null ? ref3 : default_host;
          data = {
            stamp: now,
            host: host,
            session: (ref5 = (ref6 = _this.session) != null ? ref6._id : void 0) != null ? ref5 : null,
            application: name,
            event: e,
            msg: text
          };
          if (arg != null) {
            data.data = arg;
          }
          if (extra.length > 0) {
            data.extra = extra;
          }
          if (e === 'trace') {
            if (!dev_logger) {
              return;
            }
          }
          if (dev_logger) {
            _debug.apply(null, [now + " " + host + " " + text].concat(slice.call(args)));
          }
          if ((cuddly_io != null) && indexOf.call(events, e) >= 0) {
            cuddly_io.emit(event, data);
          }
          if (gelf_config != null) {
            message = {
              host: data.host,
              short_message: data.msg,
              facility: data.event,
              _stamp: data.stamp,
              _application: data.application
            };
            if (data.data != null) {
              message._data = data.data;
              if (typeof message._data === 'object' && (message._data.length == null)) {
                ref7 = message._data;
                for (k in ref7) {
                  if (!hasProp.call(ref7, k)) continue;
                  v = ref7[k];
                  if (k.match(/^[\w-]+$/)) {
                    message["_" + k] = v;
                  }
                }
              }
            }
            if (data.extra != null) {
              message._extra = data.extra;
            }
            if (data.session != null) {
              message._session = data.session;
            }
            request.post(gelf_config.url).ca(gelf_config.ca).cert(gelf_config.cert).key(gelf_config.key).send(message).end(function(err, res) {
              if (err || !res.ok) {
                return __debug('Error', err);
              }
            });
          }
        };
      };
    })(this);
    debug = make_debug('trace');
    events.forEach((function(_this) {
      return function(e) {
        return debug[e] = make_debug(e);
      };
    })(this));
    return debug;
  };

  module.exports.init = function(cfg) {
    if (cfg.cuddly_url != null) {
      cuddly_url = cfg.cuddly_url;
    }
    if (cfg.dev_logger != null) {
      dev_logger = cfg.dev_logger;
    }
    if (cfg.gelf != null) {
      gelf_config = cfg.gelf;
    }
    if (cfg.host != null) {
      default_host = cfg.host;
    }
    if (cuddly_url != null) {
      return cuddly_io != null ? cuddly_io : cuddly_io = IO(cuddly_url);
    }
  };

  module.exports.enable = Debug.enable;

  module.exports.set_dev_logger = function(value) {
    return dev_logger = value;
  };

  module.exports.default_host = default_host;

}).call(this);
