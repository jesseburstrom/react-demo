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

playerdb.getTopScoresOrdinary = (count) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM highscoresordinary ORDER BY score DESC LIMIT ?",
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

playerdb.getTopScoresMini = (count) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM highscoresmini ORDER BY score DESC LIMIT ?",
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

playerdb.getTopScoresMaxi = (count) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM highscoresmaxi ORDER BY score DESC LIMIT ?",
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

playerdb.updateHighScoresOrdinary = (count, score) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO highscoresordinary (Name,Score) VALUES ?; SELECT * FROM highscoresordinary ORDER BY score DESC LIMIT " + count,
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

playerdb.updateHighScoresMini = (count, score) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO highscoresmini (Name,Score) VALUES ?; SELECT * FROM highscoresmini ORDER BY score DESC LIMIT " + count,
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

playerdb.updateHighScoresMaxi = (count, score) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO highscoresmaxi (Name,Score) VALUES ?; SELECT * FROM highscoresmaxi ORDER BY score DESC LIMIT " + count,
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