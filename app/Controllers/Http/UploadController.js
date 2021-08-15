'use strict'

const Database = use('Database')
const moment = require('moment')

class UploadController {

    async listUser({request, response}){
        let result = await Database.raw('select * from users')
        return result.rows
    }
}

module.exports = UploadController
