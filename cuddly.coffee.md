Report via cuddly
-----------------

    IO = require 'socket.io-client'

    events = ['dev','ops','csr']

    cuddly_url = process.env.CUDDLY_URL

    module.exports = plugin = (w) ->
      return unless cuddly_url?
      cuddly_io = IO cuddly_url

      w.on 'debug', (data) ->
        {event} = data
        return unless event in events
        cuddly_io.emit "report_#{event}", data

      return
