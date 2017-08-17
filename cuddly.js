// Generated by CoffeeScript 1.12.6
(function() {
  var IO, cuddly_url, events, plugin,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  IO = require('socket.io-client');

  events = ['dev', 'ops', 'csr'];

  cuddly_url = process.env.CUDDLY_URL;

  module.exports = plugin = function(w) {
    var cuddly_io;
    if (cuddly_url == null) {
      return;
    }
    cuddly_io = IO(cuddly_url);
    w.on('debug', function(data) {
      var event;
      event = data.event;
      if (indexOf.call(events, event) < 0) {
        return;
      }
      return cuddly_io.emit("report_" + event, data);
    });
  };

}).call(this);