We support logging using debug (console), socket.io (our own), or GELF over TLS.

    Debug = require 'debug'
    __debug = Debug 'tangible'
    util = require 'util'
    seem = require 'seem'

    EventEmitter = require 'events'

    w = new EventEmitter()

    events = ['dev','ops','csr']

    os = require 'os'
    default_host = process.env.CUDDLY_HOST ? os.hostname()

    dev_logger = process.env.NODE_ENV isnt 'production'
    dev_logger = true  if process.env.DEV_LOGGER is 'true'
    dev_logger = false if process.env.DEV_LOGGER is 'false'

    Now = -> new Date().toJSON()

    module.exports = logger = (default_name,suffix) ->

      session = @session

* session.dev_logger (boolean) whether to trace for this session

      make_debug = (e) =>

        local_name = default_name
        full_name = local_name ? '(no name)'
        full_name += ":#{suffix}" if suffix?
        _debug = Debug "#{full_name}:#{e}"

This is the actual logging function.

        (text,args...) =>
          [arg,extra...] = args

          session = @session if @session?

          now = Now()

          host = session?.logger_host ? default_host

          session_logger = session?.dev_logger

If a default name is set, we should use it.
Otherwise, we try to guess the current name based on the middleware's name. (This does not work well in async functions.)

          if not default_name?
            if local_name isnt @__middleware_name
              local_name = @__middleware_name
              full_name = local_name ? '(no name)'
              full_name += ":#{suffix}" if suffix?
              _debug = Debug "#{full_name}:#{e}"

          logging = dev_logger or session_logger

          data =
            stamp: now
            now: Date.now()
            host: host
            session: session?._id ? null
            reference: session?.reference
            application: default_name ? local_name
            method: suffix
            event: e
            msg: text
            logging: logging

If the parameters are serializable, store them as-is.
Otherwise store them as a string.

          if arg?
            try
              JSON.stringify arg
              data.data = arg
            catch error
              data.data_error = true
              data.data = util.inspect arg

          if extra.length > 0
            try
              JSON.stringify extra
              data.extra = extra
            catch error
              data.extra_error = true
              data.extra = util.inspect extra

          w.emit e, data

Debug

          if logging
            message = "#{now} #{host} #{text}"
            _debug message, args...

          return

Register for `trace` as `@debug`,

      debug = make_debug 'trace'

and inject `@debug.dev`, `@debug.ops`, `@debug.csr`.

      events.forEach (e) =>
        debug[e] = make_debug e

and inject `@debug.catch`

      debug.inspect = util.inspect

      debug.error = (msg,error) ->
        debug.dev "#{msg}: #{error.stack ? debug.inspect error}"

      debug.catch = (msg) ->
        (error) ->
          debug.error msg, error

`heal` is used to catch-and-log promises rejections (async).

      heal = (p) -> p.catch debug.catch '(caught/ignored)'

`hand` is used to wrap event handlers generators (use it instead of `seem` to log errors).

      hand = (f) ->
        F = seem f
        (args...) -> heal F args...

Include itself so that we can do `{debug,heal,hand} = (require 'tangible') 'name'`.

      debug.heal = heal
      debug.hand = hand
      debug.debug = debug

      debug.events = w

      debug

    process_logger = logger 'process'
    process.on 'uncaughtException', (error) ->
      process_logger.error 'uncaughtException', error
      throw error

    process.on 'unhandledRejection', (reason,p) ->
      process_logger.error "unhandledRejection on #{util.inspect p}", reason
      # throw reason

    logger.enable = Debug.enable
    logger.set_dev_logger = (value) ->
      dev_logger = value
    logger.default_host = default_host
    logger.use = (plugin) ->
      plugin w, logger
      logger
