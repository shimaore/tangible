    logger = require './index'

    Now = -> new Date().toJSON()

Middleware
==========

This module can be used as middleware for thinkable-ducks.

    @name = "tangible"

These are called only once per process.

    @init = init = logger.init

    non_call_logger = (suffix,session) ->

      name = @__middleware_name
      name += ":#{suffix}" if suffix?

      @debug = logger name, session

    @config = ->
      init @cfg
      non_call_logger.call this, 'config'

    @server_pre = ->
      init @cfg
      non_call_logger.call this, 'server_pre'

    @web = ->
      # FIXME statistics
      non_call_logger.call this, 'web'

    @notify = ({socket}) ->
      socket.emit 'register', event:'tangile:dev_logger', default_room:'support'
      socket.on 'tangible:dev_logger', (enabled) ->
        dev_logger = enabled

      socket.emit 'register', event:'tangile:enable', default_room:'support'
      socket.on 'tangible:enable', (namespaces) ->
        logger.Debug.enable namespaces
      non_call_logger.call this, 'notify'

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

      non_call_logger.call this, null, @session
