    describe 'The module', ->
      it 'should load', ->
        require '..'


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
