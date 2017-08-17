// Generated by CoffeeScript 1.12.7
(function() {
  var Redis, debug, plugin;

  Redis = require('ioredis');

  debug = (require('debug'))('tangible:redis');

  module.exports = plugin = function(w) {
    var Notepack, client, encode, log, log_if, redis_url;
    redis_url = process.env.TANGIBLE_REDIS;
    if (redis_url == null) {
      return;
    }
    client = new Redis(redis_url);
    encode = (function() {
      switch (process.env.TANGIBLE_ENCODE) {
        case 'notepack.io':
          Notepack = require('notepack.io');
          return function(data) {
            return Notepack.encode(data);
          };
        default:
          return function(data) {
            return JSON.stringify(data);
          };
      }
    })();
    log = function(data) {
      return client.publish("tangible:" + data.event, encode(data))["catch"](function(error) {
        return debug("publish: " + error.stack);
      });
    };
    log_if = function(data) {
      if (data.logging) {
        return log(data);
      }
    };
    w.on('dev', log);
    w.on('csr', log);
    w.on('ops', log);
    w.on('trace', log_if);
  };

}).call(this);
