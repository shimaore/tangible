// Generated by CoffeeScript 1.12.6
(function() {
  var Debug, IO, Now, __debug, cuddly_io, cuddly_url, default_host, dev_logger, events, fs, gelf_config, k, logger, map, n, os, ref, request, util,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    hasProp = {}.hasOwnProperty;

  Debug = require('debug');

  IO = require('socket.io-client');

  request = require('superagent');

  __debug = Debug('tangible');

  util = require('util');

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

  dev_logger = process.env.NODE_ENV !== 'production';

  if (process.env.DEV_LOGGER === 'true') {
    dev_logger = true;
  }

  if (process.env.DEV_LOGGER === 'false') {
    dev_logger = false;
  }

  Now = function() {
    return new Date().toJSON();
  };

  module.exports = logger = function(name) {
    var debug, make_debug;
    make_debug = (function(_this) {
      return function(e) {
        var _debug, event, local_debug, local_name;
        event = "report_" + e;
        if (name != null) {
          _debug = Debug(name + ":" + e);
        } else {
          local_name = local_debug = null;
        }
        return function() {
          var arg, args, data, error, extra, host, message, now, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, session_logger, text, v;
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
            try {
              JSON.stringify(arg);
              data.data = arg;
            } catch (error1) {
              error = error1;
              data.data_error = true;
              data.data = util.inspect(arg);
            }
          }
          if (extra.length > 0) {
            try {
              JSON.stringify(extra);
              data.extra = extra;
            } catch (error1) {
              error = error1;
              data.extra_error = true;
              data.extra = util.inspect(extra);
            }
          }
          session_logger = (ref7 = _this.session) != null ? ref7.dev_logger : void 0;
          if (e === 'trace') {
            if (!(dev_logger || session_logger)) {
              return;
            }
          }
          if (dev_logger || session_logger) {
            message = now + " " + host + " " + text;
            if (name != null) {
              _debug.apply(null, [message].concat(slice.call(args)));
            } else {
              if (local_name !== _this.__middleware_name) {
                local_name = (ref8 = _this.__middleware_name) != null ? ref8 : '(no name)';
                local_debug = Debug(local_name + ":" + e);
              }
              if (typeof local_debug === "function") {
                local_debug.apply(null, [message].concat(slice.call(args)));
              }
            }
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
              _application_name: data.application
            };
            if (data.data != null) {
              message._data = data.data;
              if (typeof message._data === 'object' && (message._data.length == null)) {
                ref9 = message._data;
                for (k in ref9) {
                  if (!hasProp.call(ref9, k)) continue;
                  v = ref9[k];
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
            if (data.data_error != null) {
              message._data_error = data.data_error;
            }
            if (data.extra_error != null) {
              message._extra_error = data.extra_error;
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
    debug.inspect = util.inspect;
    debug.error = function(msg, error) {
      var ref1;
      return debug.dev(msg + ": " + ((ref1 = error.stack) != null ? ref1 : debug.inspect(error)));
    };
    debug["catch"] = function(msg) {
      return function(error) {
        return debug.error(msg, error);
      };
    };
    return debug;
  };

  module.exports.init = function(cfg) {
    var process_logger;
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
      if (cuddly_io == null) {
        cuddly_io = IO(cuddly_url);
      }
    }
    process_logger = logger('process');
    process.on('uncaughtException', function(error) {
      process_logger.error('uncaughtException', error);
      throw error;
    });
    return process.on('unhandledRejection', function(reason, p) {
      return process_logger.error("unhandledRejection on " + (util.inspect(p)), reason);
    });
  };

  module.exports.enable = Debug.enable;

  module.exports.set_dev_logger = function(value) {
    return dev_logger = value;
  };

  module.exports.default_host = default_host;

}).call(this);
