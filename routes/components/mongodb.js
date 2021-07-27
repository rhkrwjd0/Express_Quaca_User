
//mongoDB 

require("dotenv").config();
console.log("MongoDB > ",process.env.MongoDB);

var url = process.env.MongoDB;



exports.url = url;
