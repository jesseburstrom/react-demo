const mysql = require('mysql');

const pool = mysql.createPool({
  multipleStatements: true,
  connectionLimit: 10,

  host: "localhost",

  user: "jesse",
  password: "Grinander1",
  
  port: "3306",
  database: 'yatzy'
  
});

let playerdb = {};


playerdb.checkLogin = (user) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM users WHERE (user,password) = ? LIMIT 1", [[user]], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

playerdb.getLogin = (user) => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM users WHERE user = ? LIMIT 1", [user], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

playerdb.setLogin = (user) => {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO users (user,password) VALUES ?", [[user]], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

playerdb.getTopScores = (count) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM highscores ORDER BY score DESC LIMIT ?",
      count,
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

playerdb.updateHighScores = (score) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO highscores (Name,Score) VALUES ?; SELECT * FROM highscores ORDER BY score DESC LIMIT 10",
      [[score]],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};


playerdb.executeSql = (sqlStatement) => {
    return new Promise((resolve, reject) => {
        pool.query(sqlStatement, (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
};

module.exports = playerdb;