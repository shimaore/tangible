Report via cuddly
-----------------

    IO = require 'socket.io-client'

    cuddly_url = process.env.CUDDLY_URL

    module.exports = plugin = (w) ->
      return unless cuddly_url?
      cuddly_io = IO cuddly_url

      log = (data) ->
        cuddly_io.emit "report_#{data.event}", data

      log_if = (data) ->
        if data.logging
          log data

      w.on 'dev', log
      w.on 'ops', log
      w.on 'csr', log_if
      # do not log trace
      return
