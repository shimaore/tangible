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

      w.on 'debug', (data) ->
        client
        .publish 'tangible:debug', encode data
        .catch (error) ->
          debug "publish: #{error.stack}"

      return
