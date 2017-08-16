    fs = require 'fs'
    do ->
        process.env.GELF_URL = 'https://logs.k-net.fr:12201/gelf'
        process.env.GELF_KEY = 'local-test/ccnq.key'
        process.env.GELF_CERT = 'local-test/ccnq.crt'
        process.env.GELF_CA = 'local-test/ca.crt'

        tangible = require '..'

        tangible.set_dev_logger true
        debug = tangible 'foo'
        debug 'more test once again', misc: true, my_data: { a:3, b:4, c:5 }
        debug.dev 'It works, rejoice!'
        return
