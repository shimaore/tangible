We support logging using debug (console), socket.io (our own), or GELF over TLS.

    Debug = require 'debug'
    IO = require 'socket.io-client'
    request = require 'superagent'
    __debug = Debug 'tangible'
    util = require 'util'

Same semantics as in `cuddly`:

Development/devops support messages
-----------------------------------

Indicate potential bug, internal inconsistency, or non-transient deployment problem.

```
tangible.dev('Expected the candy type to be set in GrabCandy().')
```

Operational support messages
----------------------------

Indicate non-customer-specific operational (transient) problem.

```
tangible.ops('The candy server is not reachable.')
```

Customer support messages
-------------------------

Indicate customer-specific problem (e.g. configuration entry).

```
tangile.csr('Customer Bar is out of candies.')
```

Debug megssages
---------------

Developper low-level messages, normally not enabled.

```
tangile('Checking 1,2,3')
```

    events = ['dev','ops','csr']

    os = require 'os'
    fs = require 'fs'
    default_host = process.env.CUDDLY_HOST ? os.hostname()

    cuddly_url = process.env.CUDDLY_URL
    cuddly_io = null

    gelf_config = null
    if process.env.GELF_URL?
      map =
        key: 'GELF_KEY'
        cert: 'GELF_CERT'
        ca: 'GELF_CA'
      gelf_config =
        url: process.env.GELF_URL
      for k,n of map when n of process.env
        gelf_config[k] = fs.readFileSync process.env[n]

    dev_logger = process.env.NODE_ENV isnt 'production'
    dev_logger = true  if process.env.DEV_LOGGER is 'true'
    dev_logger = false if process.env.DEV_LOGGER is 'false'

    Now = -> new Date().toJSON()

    module.exports = logger = (name) ->

* session.dev_logger (boolean) whether to trace for this session

      make_debug = (e) =>

        event = "report_#{e}"
        if name?
          _debug = Debug "#{name}:#{e}"
        else
          local_name = local_debug = null

        (text,args...) =>
          [arg,extra...] = args

          now = @session?.logger_stamp ? Now()

          host = @session?.logger_host ? default_host

          data =
            stamp: now
            host: host
            session: @session?._id ? null
            application: name
            event: e
            msg: text

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

Debug

          session_logger = @session?.dev_logger

          if e is 'trace'
            return unless dev_logger or session_logger

          if dev_logger or session_logger
            message = "#{now} #{host} #{text}"
            if name?
              _debug message, args...
            else
              if local_name isnt @__middleware_name
                local_name = @__middleware_name ? '(no name)'
                local_debug = Debug "#{local_name}:#{e}"
              local_debug? message, args...

Report via cuddly

          if cuddly_io? and e in events
            cuddly_io.emit event, data

Report via gelf

          if gelf_config?
            message =
              host: data.host
              short_message: data.msg
              facility: data.event
              _stamp: data.stamp
              _application: data.application

            if data.data?
              message._data     = data.data
              if typeof message._data is 'object' and not message._data.length?
                for own k,v of message._data when k.match /^[\w-]+$/
                  message["_#{k}"] = v
            message._extra    = data.extra    if data.extra?
            message._session  = data.session  if data.session?

            request
            .post gelf_config.url
            .ca gelf_config.ca
            .cert gelf_config.cert
            .key gelf_config.key
            .send message
            .end (err,res) ->
              if err or not res.ok
                __debug 'Error', err

          return

Register for `trace` as `@debug`,

      debug = make_debug 'trace'

and inject `@debug.dev`, `@debug.ops`, `@debug.csr`.

      events.forEach (e) =>
        debug[e] = make_debug e
      debug

    module.exports.init = (cfg) ->
      cuddly_url = cfg.cuddly_url if cfg.cuddly_url?
      dev_logger = cfg.dev_logger if cfg.dev_logger?
      gelf_config = cfg.gelf if cfg.gelf?
      default_host = cfg.host if cfg.host?

      cuddly_io ?= IO cuddly_url if cuddly_url?

    module.exports.enable = Debug.enable
    module.exports.set_dev_logger = (value) ->
      dev_logger = value
    module.exports.default_host = default_host
