Report using GELF
-----------------

    Debug = require 'debug'
    request = require 'superagent'
    debug = Debug 'tangible:gelf'

    fs = require 'fs'

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

    module.exports = plugin = (w) ->
      return unless gelf_config?

      log = (data) ->
        message =
          host: data.host
          short_message: data.msg
          facility: data.event
          _stamp: data.stamp
          _application_name: data.application

        if data.data?
          message._data = data.data
          if typeof message._data is 'object' and not message._data.length?
            for own k,v of message._data when k.match /^[\w-]+$/
              message["_#{k}"] = v
        message._extra    = data.extra    if data.extra?
        message._session  = data.session  if data.session?
        message._data_error  = data.data_error  if data.data_error?
        message._extra_error = data.extra_error if data.extra_error?

        request
        .post gelf_config.url
        .ca gelf_config.ca
        .cert gelf_config.cert
        .key gelf_config.key
        .send message
        .end (err,res) ->
          if err or not res.ok
            debug 'Error', err
        return

      log_if = (data) ->
        if data.logging
          log.data

      w.on 'dev', log
      w.on 'ops', log
      w.on 'csr', log_if
      # do not log trace
      return
