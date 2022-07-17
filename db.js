const spicedPg = require("spiced-pg");
const username = "a";
const password = "postgres";
const database = "signatures";
const db = spicedPg(
  `postgres:${username}:${password}@localhost:5432/${database}`
);

// const spicedPg = require("spiced-pg");
//const db = spicedPg("postgres:a:postgres@localhost:5432/signatures");

module.exports.getCities = () => {
  return db.query(` SELECT  *  FROM actors`);
};

module.exports.addcity = (city, country) => {
  return db.query(
    `
        INSERT INTO cities (city,country)
        VALUES ($1,$2)`,
    [city, country]
  );
};

module.exports.addSignature = (first, last, signature) => {
  return db.query(
    `INSERT INTO SIGNATURES(first,last,signature)
    VALUES($1,,$2,$3)`,
    [first, last, signature]
  );
};

module.exports.countSignatures = () => {
  return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.getAllSignatures = () => {
  return db.query(`SELECT * FROM signatures`);
};
