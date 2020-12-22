const mysql = require("mysql");
const dotenv = require("dotenv");

// initialize env variables
dotenv.config();

// connect to db
const connection = mysql.createPool({
  connectionLimit: 1,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const fetchAuth = (id) => {
  let sql = `SELECT * FROM ${process.env.DB_TABLE_AUTH_SETTINGS} WHERE team_id = ? AND app_id = ?`;
  const inserts = [id, process.env.APP_ID];
  sql = mysql.format(sql, inserts);

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }

      // no results
      if (result.length === 0) {
        return resolve(false);
      }

      // return auth
      const { json_value } = result[0];
      return resolve(JSON.parse(json_value));
    });
  });
};

const storeAuth = async (authPayload, id) => {
  let sql = `INSERT INTO ${process.env.DB_TABLE_AUTH_SETTINGS} VALUES (?, ?, 'auth', NULL, NULL, ?, 'demo-builder') ON DUPLICATE KEY UPDATE json_value= ?`;
  let inserts = [id, process.env.APP_ID, authPayload, authPayload];
  sql = mysql.format(sql, inserts);

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

module.exports = {
  fetchAuth,
  storeAuth,
};
