var mysql = require('mysql'),
	dbConfig = require('./dbConfig'),
	conn = mysql.createConnection(dbConfig.option);

module.exports = conn; 