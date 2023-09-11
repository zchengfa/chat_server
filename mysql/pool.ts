const mysql = require('mysql')

module.exports = function connect(){
    return mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '19961212',
        database: 'mall',
        multipleStatements: true
    })
}