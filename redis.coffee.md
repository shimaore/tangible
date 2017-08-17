    Redis = require 'ioredis'
    debug = (require 'debug') 'tangible:redis'

    redis_url = process.env.TANGIBLE_REDIS

    module.exports = plugin = (w) ->
      return unless redis_url?
      client = new Redis redis_url

      encode = switch process.env.TANGIBLE_ENCODE

        when 'notepack.io'
          Notepack = require 'notepack.io'
          (data) -> Notepack.encode data

        else
          (data) -> JSON.stringify data

      log = (data) ->
        client
        .publish "tangible:#{data.event}", encode data
        .catch (error) ->
          debug "publish: #{error.stack}"

      log_if = (data) ->
        if data.logging
          log data

      w.on 'dev', log
      w.on 'csr', log
      w.on 'ops', log
      w.on 'trace', log_if
      return
