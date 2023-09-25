const { Pool } = require('pg');
//const { host, port, user, password, database } = require('../src/dadosConexao')

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123456',
    database: 'dindin'
})

module.exports = pool;