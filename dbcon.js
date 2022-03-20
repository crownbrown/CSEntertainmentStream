var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_thatches',
  password        : '3344',
  database        : 'cs340_thatches'
});
module.exports.pool = pool;
