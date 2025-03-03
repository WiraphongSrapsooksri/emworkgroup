const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME, 
  // port: parseInt(process.env.DB_PORT, 10), 
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};


const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("Database Connected");
    return pool;
  })
  .catch((err) => {
    console.error("Database Connection Failed", err);
  });

module.exports = { sql, poolPromise };
