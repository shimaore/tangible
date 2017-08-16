    logger = require './index'
    .use require './cuddly'
    .use require './gelf'
    .use require './redis'
    .use require './net'

    repl = require './repl'

    Now = -> new Date().toJSON()

Middleware
==========

This module can be used as middleware for thinkable-ducks.

    @name = "tangible"

These are called only once per process.

    init = (cfg) ->
      logger.set_dev_logger cfg.dev_logger if cfg.dev_logger?
      logger.default_host = cfg.host if cfg.host?

    @config = ->
      init @cfg
      @debug = logger null, 'config'

    @server_pre = ->
      init @cfg
      logger.use repl this
      @debug = logger null, 'server_pre'

    @web = ->
      # FIXME statistics
      @debug = logger null, 'web'

    @notify = ({socket}) ->
      socket.emit 'register', event:'tangible:dev_logger', default_room:'support'
      socket.on 'tangible:dev_logger', (enabled) ->
        logger.set_dev_logger enabled

      socket.emit 'register', event:'tangible:enable', default_room:'support'
      socket.on 'tangible:enable', (namespaces) ->
        logger.enable namespaces

      @debug = logger null, 'notify'

This is called once per incoming call.

    uuidV4 = require 'uuid/v4'

    @include = ->

      now = Now()
      uuid = uuidV4()

      host = @cfg.host ? logger.default_host
      @session.logger_stamp = now
      @session.logger_host = host
      @session.logger_uuid = uuid
      id = [host,now,uuid].join '-'
      @session._id = id

* session._id (string) A unique identifier for this session/call.

      @debug = logger.call this
