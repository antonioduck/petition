const spicedPg = require("spiced-pg");
const username = "postgres";
const password = "postgres";
const database = "petition";
const db = spicedPg(
  `postgres:${username}:${password}@localhost:5432/${database}`
);
const bcrypt = require("bcryptjs");
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

// Used for REGISTRATION
function hashPassword(password) {
  return bcrypt.genSalt().then((salt) => {
    return bcrypt.hash(password, salt);
  });

  // 1. Generate a salt
  // 2. Hash the password with the salt
  // 3. Return the hash
  // [PROMISE]
}

// Used for REGISTRATION
module.exports.insertUser = (first, last, email, password) => {
  return hashPassword(password).then((hashedPassword) => {
    return db.query(
      `INSERT INTO users(first,last,email,password)
    VALUES($1,$2,$3,$4) RETURNING ID`,
      [first, last, email, hashedPassword]
      // 1. Hash the user's password [PROMISE]
      // 2. INSERT into the database with a query
      // 3. Return the entire row
      // so that we can store the user's id in the session!
    );
  });
};

// Used for LOGIN
module.exports.findUserByEmail = (email) => {
  return db.query(`SELECT * FROM USERS WHERE EMAIL =$1`, [email]);
  // return db.query(....)
};
// Used for LOGIN
// Returns a PROMISE. Resolves:
// - the found users row if found
// - an error if anything goes wrong
// (no email found OR wrong password)

module.exports.authenticateUser = (email, password) => {
  throw new Error("Authentication failed");
  return new Promise(
    (resolved) => {},
    (reject) => {}
  );
  // 1. Look for a user with the given email
  // 2. If not found, throw an error!
  // 3. Compare the given password with the hashed password of the found user.
  // (use bcrypt!)
  // 4. Resolve
  // - return the found user (need it for adding to the session!)
  // - throw an error if password does not match!
};
