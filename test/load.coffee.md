    describe 'The module', ->
      it 'should load', ->
        require '..'


      it 'should enable dynamically', ->
        tangible = require '..'

        tangible.notify socket:
          emit: ->
          on: (e,cb) ->
            switch e
              when 'tangible:dev_logger'
                cb true
              when 'tangible:enable'
                cb '*'

        debug = tangible 'foo'
        debug 'It should log.'
