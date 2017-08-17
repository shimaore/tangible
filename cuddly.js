// Generated by CoffeeScript 1.12.7
(function() {
  var IO, plugin;

  IO = require('socket.io-client');

  module.exports = plugin = function(w) {
    var cuddly_io, cuddly_url, log, log_if;
    cuddly_url = process.env.CUDDLY_URL;
    if (cuddly_url == null) {
      return;
    }
    cuddly_io = IO(cuddly_url);
    log = function(data) {
      return cuddly_io.emit("report_" + data.event, data);
    };
    log_if = function(data) {
      if (data.logging) {
        return log(data);
      }
    };
    w.on('dev', log);
    w.on('ops', log);
    w.on('csr', log_if);
  };

}).call(this);
