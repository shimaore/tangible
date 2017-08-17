// Generated by CoffeeScript 1.12.7
(function() {
  var debug, format, net, plugin, util;

  net = require('net');

  util = require('util');

  debug = (require('debug'))('tangible:net');

  format = function(d) {
    switch (false) {
      case !(d == null):
        return '';
      case typeof d !== 'string':
        return d + "\n";
      default:
        return (JSON.stringify(d)) + "\n";
    }
  };

  module.exports = plugin = function(w) {
    var host, ipc, port, server;
    switch (false) {
      case process.env.TANGIBLE_PORT == null:
        server = net.createServer();
        port = parseInt(process.env.TANGIBLE_PORT);
        host = process.env.TANGIBLE_HOST;
        server.listen(port, host);
        break;
      case process.env.TANGIBLE_IPC == null:
        server = net.createServer();
        ipc = process.env.TANGIBLE_IPC;
        server.listen(ipc);
        break;
      default:
        return;
    }
    return server.on('connection', function(socket) {
      var log, log_if, missed, ready, stop;
      ready = true;
      missed = 0;
      log = function(data) {
        var message, ref;
        if (!ready) {
          missed++;
          return;
        }
        message = ['-', data.stamp, (ref = data.reference) != null ? ref : '', data.host, data.event, data.application, data.method, data.msg].join(' ');
        message += '\n';
        if (data.data != null) {
          message += format(data.data);
        }
        if (data.extra != null) {
          message += format(data.extra);
        }
        ready = socket.write(message, function() {
          if (missed) {
            message = "- Missed " + missed + "\n";
            missed = 0;
            socket.write(message);
          }
          return ready = true;
        });
      };
      log_if = function(data) {
        if (data.logging) {
          return log(data);
        }
      };
      w.on('dev', log);
      w.on('ops', log);
      w.on('csr', log);
      w.on('trace', log_if);
      stop = function() {
        w.removeListener('dev', log);
        w.removeListener('ops', log);
        w.removeListener('csr', log);
        return w.removeListener('trace', log_if);
      };
      socket.once('error', stop);
      socket.once('end', stop);
      socket.once('timeout', function() {
        stop();
        return socket.end();
      });
    });
  };

}).call(this);
