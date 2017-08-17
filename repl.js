// Generated by CoffeeScript 1.12.5
(function() {
  var net, plugin, repl,
    hasProp = {}.hasOwnProperty;

  repl = require('repl');

  net = require('net');

  module.exports = plugin = function(context) {
    return function(w, logger) {
      var host, ipc, port, server;
      if (!((process.env.TANGIBLE_REPL_PORT != null) || (process.env.TANGIBLE_REPL_IPC != null))) {
        return;
      }
      server = net.createServer(function(socket) {
        var base, k, r, v;
        r = repl.start({
          prompt: socket.remoteAddress + ":" + socket.remotePort + "→" + socket.localAddress + ":" + socket.localPort + " > ",
          input: socket,
          output: socket,
          terminal: true,
          useGlobal: false
        });
        r.on('exit', function() {
          return socket.end();
        });
        r.context.socket = socket;
        r.context.debug = w;
        r.context.tangible = logger;
        for (k in context) {
          if (!hasProp.call(context, k)) continue;
          v = context[k];
          if ((base = r.context)[k] == null) {
            base[k] = v;
          }
        }
      });
      switch (false) {
        case process.env.TANGIBLE_REPL_PORT == null:
          port = parseInt(process.env.TANGIBLE_REPL_PORT);
          host = process.env.TANGIBLE_REPL_HOST;
          server.listen(port, host);
          break;
        case process.env.TANGIBLE_REPL_IPC == null:
          ipc = process.env.TANGIBLE_REPL_IPC;
          server.listen(ipc);
      }
    };
  };

}).call(this);
