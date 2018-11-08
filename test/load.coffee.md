    describe 'The module', ->
      it 'should load', ->
        require '..'

      it 'should have a name', ->
        tangible = require '..'

        unless 'name' of tangible
          throw new Errror 'missing @name'

      it 'should accept weird data', ->
        Debug = require '..'
        debug = Debug 'test-debug'
        debug 'hello world', (Buffer.from 'weird'), (Buffer.from 'weirder'), (Buffer.from 'weirderer\0x00')

      it 'should log unhandled rejection', ->
        Promise.reject new Error 'on purpose'
        return

      it 'should log errors', ->
        Debug = require '..'
        new Promise (resolve) ->
          debug = Debug 'me'
          Debug.events.once 'me:dev', resolve
          debug.dev 'Logging'

      it 'should catch errors', ->
        Debug = require '..'
        new Promise (resolve) ->
          debug = Debug 'me-too'
          Debug.events.once 'me-too:dev', resolve
          Promise
            .reject new Error 'on purpose'
            .catch debug.catch 'Catching'

      it 'should provide heal', ->
        Debug = require '..'
        new Promise (resolve) ->
          {heal,debug} = Debug 'me-also'
          Debug.events.once 'me-also:dev', resolve
          heal Promise.reject new Error 'on purpose'

      it 'should provide foot', ->
        Debug = require '..'
        new Promise (resolve) ->
          {foot,debug} = (require '..') 'me-foot'
          Debug.events.once 'me-foot:dev', resolve
          EventEmitter = require 'events'
          ev = new EventEmitter()
          ev.once 'booh', foot ->
            await 0
            throw new Error 'on purpose'
          ev.emit 'booh'
