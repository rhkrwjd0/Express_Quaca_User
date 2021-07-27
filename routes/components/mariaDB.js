var mysql = require('mysql');
require("dotenv").config();

console.log("MariaDB_HOST",process.env.MariaDB_HOST);
console.log("MariaDB_PORT",process.env.MariaDB_PORT);
console.log("MariaDB_USER",process.env.MariaDB_USER);
console.log("MariaDB_PASS",process.env.MariaDB_PASS);
console.log("MariaDB_DATABASE",process.env.MariaDB_DATABASE);
var connection = mysql.createConnection({

    host: process.env.MariaDB_HOST,
    port: process.env.MariaDB_PORT,
    user: process.env.MariaDB_USER,
    password: process.env.MariaDB_PASS,
    database: process.env.MariaDB_DATABASE,
    typeCast: function (field, next) {
        if (field.type == "VAR_STRING") {
            return field.string();


        }
        return next();
    },
});


exports.connection = connection;



