    describe 'The module', ->
      it 'should load', ->
        require '..'
        require '../cuddly'
        require '../gelf'
        require '../middleware'
        require '../net'
        require '../redis'
        require '../repl'

      it 'should enable dynamically', ->
        tangible = require '..'
        mw = require '../middleware'

        mw.notify socket:
          emit: ->
          on: (e,cb) ->
            switch e
              when 'tangible:dev_logger'
                cb true
              when 'tangible:enable'
                cb '*'

        debug = tangible 'foo'
        debug 'It should log.'

      it 'should have a name', ->
        tangible = require '..'

        unless 'name' of tangible
          throw new Errror 'missing @name'

      it 'should server_pre' , ->
        mw = require '../middleware'
        ctx =
          cfg: {}
        mw.server_pre.call ctx, ctx

      it 'should include', ->
        mw = require '../middleware'
        ctx =
          cfg: {}
          session: {}
        mw.include.call ctx, ctx

      it 'should accept weird data', ->
        Debug = require '..'
        debug = Debug 'test-debug'
        debug 'hello world', (new Buffer 'weird'), (new Buffer 'weirder'), (new Buffer ('weirderer\0x00'))

      it 'should log unhandled rejection', ->
        Promise.reject new Error 'on purpose'
        return

      it 'should log errors', ->
        new Promise (resolve) ->
          debug = (require '..') 'me'
          debug.events.on 'dev', resolve
          debug.dev 'Logging'

      it 'should catch errors', ->
        new Promise (resolve) ->
          debug = (require '..') 'me'
          debug.events.on 'dev', resolve
          Promise
            .reject new Error 'on purpose'
            .catch debug.catch 'Catching'

      it 'should provide heal', ->
        new Promise (resolve) ->
          {heal,debug} = (require '..') 'me'
          debug.events.on 'dev', resolve
          heal Promise.reject new Error 'on purpose'

      it 'should provide hand', ->
        new Promise (resolve) ->
          {hand,debug} = (require '..') 'me'
          debug.events.on 'dev', resolve
          EventEmitter = require 'events'
          ev = new EventEmitter()
          ev.once 'booh', hand ->
            yield 0
            throw new Error 'on purpose'
          ev.emit 'booh'
