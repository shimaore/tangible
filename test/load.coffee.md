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
