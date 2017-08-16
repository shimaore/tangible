    repl = require 'repl'
    net = require 'net'

    module.exports = plugin = (context) -> (w,logger) ->
      return unless process.env.TANGIBLE_REPL_PORT? or process.env.TANGIBLE_REPL_IPC?

      server = net.createServer (socket) ->
        r = repl.start
          prompt: "#{socket.remoteAddress}:#{socket.remotePort}→#{socket.localAddress}:#{socket.localPort} > "
          input: socket
          output: socket
          terminal: true
          useGlobal: false
        r.on 'exit', ->
          socket.end()
        r.context.socket = socket
        r.context.debug = w
        r.context.tangible = logger
        for own k,v of context
          r.context[k] ?= v
        return

      switch
        when process.env.TANGIBLE_REPL_PORT?
          port = parseInt process.env.TANGIBLE_REPL_PORT
          host = process.env.TANGIBLE_REPL_HOST
          server.listen port, host
        when process.env.TANGIBLE_REPL_IPC?
          ipc = process.env.TANGIBLE_REPL_IPC
          server.listen ipc

      return
