    net = require 'net'
    util = require 'util'

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
          d
        else
          JSON.stringify d

    module.exports = plugin = (w) ->
      return unless server?

      server.on 'connection', (socket) ->
        ready = true
        missed = 0

        w.on 'debug', (data) ->
          if not ready
            missed++
            return

          ready = socket.write """
            ---
            #{data.stamp} #{data.reference ? ''} #{data.host}
            #{data.event} #{data.application} #{data.method ? ''}
            #{data.msg}
            #{format data.data}
            #{format data.extra}


            """
          , ->
            socket.write """
              --- Missed #{missed}

              """
            missed = 0
            ready = true

          return
