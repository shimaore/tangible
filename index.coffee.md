    Debug = require 'debug'
    {inspect,debuglog} = require 'util'

    {EventEmitter2} = require 'eventemitter2'

    w = new EventEmitter2
      wildcard: true
      delimiter: ':'
      verboseMemoryLeak: true

    events = ['dev','ops','csr']

    os = require 'os'
    host = process.env.TANGIBLE_HOST ? os.hostname()

    module.exports = logger = (name) ->

      make_debug = (e) ->

        full_name = "#{name}:#{e}"

        _debug = Debug full_name
        _debuglog = debuglog full_name

This is the actual logging function.

        (text,args...) ->
          _debug text, args...
          _debuglog text, args...

          return unless w.listenerCount full_name

          now = Date.now()

          data =
            stamp: new Date(now).toJSON()
            now: now
            host: host
            application: name
            event: e
            msg: text

If the parameters are serializable, store them as-is.
Otherwise store them as a string.

          try
            JSON.stringify args
            data.data = args
          catch error
            data.data_error = true
            data.data = logger.inspect args

          w.emit full_name, data

          return

Register for `trace` as `@debug`,

      debug = make_debug 'trace'

and inject `@debug.dev`, `@debug.ops`, `@debug.csr`.

      events.forEach (e) =>
        debug[e] = make_debug e

and inject `@debug.catch`

      debug.error = (msg,error) ->
        debug.dev "#{msg}: #{error.stack ? logger.inspect error}"

      debug.catch = (msg) ->
        (error) ->
          debug.error msg, error

`heal` is used to catch-and-log promises rejections (async).

      heal = (t,p=null) ->
        if not p?
          t.catch debug.catch '(caught/ignored)'
        else
          p.catch debug.catch t

`foot` is used to wrap async event handlers.

      foot = (t,f=null) ->
        if not f?
          (args...) -> heal t args...
        else
          (args...) -> heal t, f args...

Include itself so that we can do `{debug,heal,hand} = (require 'tangible') 'name'`.

      debug.heal = heal
      debug.foot = foot
      debug.debug = debug

      debug

    process_logger = logger 'process'
    process.on 'uncaughtException', (error) ->
      process_logger.error 'uncaughtException', error
      process.exit 2

    process.on 'unhandledRejection', (reason,p) ->
      process_logger.error "unhandledRejection on #{logger.inspect p}", reason
      process.exit 2 if process.env.EXIT_ON_UNHANDLED_REJECTION is 'yes'

    logger.inspect = inspect
    logger.events = w
    logger.use = (plugin) ->
      plugin logger
      logger
