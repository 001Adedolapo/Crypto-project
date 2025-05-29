const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         // or your MySQL username
  password: '',         // add your MySQL password if any
  database: 'crypto_exchange'
});

module.exports = pool.promise();
