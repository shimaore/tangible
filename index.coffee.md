We support logging using debug (console), socket.io (our own), or GELF over TLS.

    Debug = require 'debug'
    IO = require 'socket.io-client'
    request = require 'superagent'
    __debug = Debug 'tangible'

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

    dev_logger = true
    dev_logger = true if process.env.DEV_LOGGER is 'true'
    dev_logger = false if process.env.DEV_LOGGER is 'false'

    Now = -> new Date().toJSON()

    module.exports = logger = (name,session) ->

      make_debug = (e) =>

        event = "report_#{e}"
        _debug = Debug "#{name}:#{e}"

        (text,arg,extra...) =>

          now = @session?.logger_stamp ? Now()

          host = @session?.logger_host ? default_host

          data =
            stamp: now
            host: host
            session: @session?._id ? null
            application: name
            event: e
            msg: text

          data.data = arg if arg?
          data.extra = extra if extra.length > 0

Debug

          if dev_logger
            _debug "#{now} #{host} #{text}", arg, extra...

Report via cuddly

          if cuddly_io? and e in events
            cuddly_io.emit event, data

Report via gelf

          if gelf_config?
            __debug 'gelf_config', gelf_config
            message =
              host: data.host
              short_message: data.msg
              facility: data.event
              _stamp: data.stamp
              _application: data.application

            if data.data?
              message._data     = data.data
              for own k,v of message._data when k.match /^[\w-]+$/
                message["_#{k}"] = v
            message._extra    = data.extra    if data.extra?
            message._session  = data.session  if data.session?

            __debug 'Going to GELF', message

            request
            .post gelf_config.url
            .ca gelf_config.ca
            .cert gelf_config.cert
            .key gelf_config.key
            .send message
            .end (err,res) ->
              if err or not res.ok
                __debug 'Error', err
              else
                __debug 'Response', res.status, res.text

          return

Register for `trace` as `@debug`,

      debug = make_debug 'trace'

and inject `@debug.dev`, `@debug.ops`, `@debug.csr`.

      events.forEach (e) =>
        debug[e] = make_debug e
      debug

Middleware
==========

This module can be used as middleware for thinkable-ducks.

    module.exports.name = "tangible"

These are called only once per process.

    module.exports.init = init = (cfg) ->
      cuddly_url = cfg.cuddly_url if cfg.cuddly_url?
      dev_logger = cfg.dev_logger if cfg.dev_logger?
      gelf_config = cfg.gelf if cfg.gelf?
      default_host = cfg.host if cfg.host?

      cuddly_io ?= IO cuddly_url if cuddly_url?

    non_call_logger = (suffix,session) ->

      name = @__middleware_name
      name += ":#{suffix}" if suffix?

      @debug = logger name, session

    module.exports.config = ->
      init @cfg
      non_call_logger.call this, 'config'

    module.exports.server_pre = ->
      init @cfg
      non_call_logger.call this, 'server_pre'

    module.exports.web = ->
      # FIXME statistics
      non_call_logger.call this, 'web'

    module.exports.notify = ({socket}) ->
      socket.emit 'register', event:'tangile:dev_logger', default_room:'support'
      socket.on 'tangible:dev_logger', (enabled) ->
        dev_logger = enabled

      socket.emit 'register', event:'tangile:enable', default_room:'support'
      socket.on 'tangible:enable', (namespaces) ->
        Debug.enable namespaces
      non_call_logger.call this, 'notify'

This is called once per incoming call.

    uuidV4 = require 'uuid/v4'

    module.exports.include = ->

      now = Now()
      uuid = uuidV4()

      host = @cfg.host ? default_host
      @session.logger_stamp = now
      @session.logger_host = host
      @session.logger_uuid = uuid
      id = [host,now,uuid].join '-'
      @session._id = id

* session._id (string) A unique identifier for this session/call.

      non_call_logger.call this, null, @session
