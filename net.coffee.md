    net = require 'net'
    util = require 'util'
    debug = (require 'debug') 'tangible:net'

    server = null

    switch
      when process.env.TANGIBLE_PORT?
        server = net.createServer()
        port = parseInt process.env.TANGIBLE_PORT
        host = process.env.TANGIBLE_HOST
        server.listen port, host

      when  process.env.TANGIBLE_IPC?
        server = net.createServer()
        ipc = process.env.TANGIBLE_IPC
        server.listen ipc

    format = (d) ->
      switch
        when not d?
          ''
        when typeof d is 'string'
          "#{d}\n"
        else
          "#{JSON.stringify d}\n"

    module.exports = plugin = (w) ->
      return unless server?

      server.on 'connection', (socket) ->
        ready = true
        missed = 0

        log = (data) ->
          if not ready
            missed++
            return

          message = [
            '-'
            data.stamp
            data.reference ? ''
            data.host
            data.event
            data.application
            data.method
            data.msg
          ].join ' '
          message += '\n'

          if data.data?
            message += format data.data
          if data.extra?
            message += format data.extra

          ready = socket.write message
          , ->
            if missed
              message = "- Missed #{missed}\n"
              missed = 0
              socket.write message
            ready = true

          return

        log_if = (data) ->
          if data.logging
            log data

        w.on 'dev', log
        w.on 'ops', log
        w.on 'csr', log
        w.on 'trace', log_if

        stop = ->
          w.removeListener 'dev', log
          w.removeListener 'ops', log
          w.removeListener 'csr', log
          w.removeListener 'trace', log_if

Error: the socket will close automatically.

        socket.once 'error', stop

End: the socket should close automatically (allowHalfOpen is false by default).

        socket.once 'end', stop

Timeout: we must end manually.

        socket.once 'timeout', ->
          stop()
          socket.end()

        return
