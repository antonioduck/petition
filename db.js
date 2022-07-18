const spicedPg = require("spiced-pg");
const username = "postgres";
const password = "postgres";
const database = "petition";
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
    VALUES($1,$2,$3) RETURNING ID`,

    [first, last, signature]
  );
};

module.exports.countSignatures = () => {
  return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.getAllSignatures = () => {
  return db.query(`SELECT * FROM signatures`);
};
module.exports.getSignaturesById = (id) => {
  return db.query(
    `

    SELECT * FROM SIGNATURES WHERE ID=$1
  `,
    [id]
  );
};
