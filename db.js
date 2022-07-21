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

// module.exports.getCities = () => {
//   return db.query(` SELECT  *  FROM actors`);
// };

// module.exports.addcity = (city, country) => {
//   return db.query(
//     `
//         INSERT INTO cities (city,country)
//         VALUES ($1,$2)`,
//     [city, country]
//   );
// };

module.exports.addSignature = (signature, userID) => {
  return db.query(
    `INSERT INTO SIGNATURES(signature, user_id)
    VALUES($1, $2) RETURNING ID`,

    [signature, userID]
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
    VALUES($1,$2,$3,$4) RETURNING id`,
      [first, last, email, hashedPassword]
      // 1. Hash the user's password [PROMISE]
      // 2. INSERT into the database with a query
      // 3. Return the entire row
      // so that we can store the user's id in the session!
    );
  });
};

// Used for LOGIN
findUserByEmail = (email) => {
  return db.query(`SELECT * FROM USERS WHERE EMAIL =$1`, [email]);
  // return db.query(....)
};
// Used for LOGIN
// Returns a PROMISE. Resolves:
// - the found users row if found
// - an error if anything goes wrong
// (no email found OR wrong password)

module.exports.authenticateUser = (email, password) => {
  let foundUser;
  return findUserByEmail(email)
    .then((user) => {
      // log user.rows, find the passwordhash
      console.log("the whole object is ", user.rows);
      console.log(
        "[db.jd] user.rows in findUserByEmail",
        user.rows[0].password
      );
      if (user.rows.length < 1) {
        throw "email not found";
      }
      foundUser = user.rows[0];
      console.log(foundUser);
      const hashFromDb = user.rows[0].password;

      return bcrypt.compare(password, hashFromDb);
    })
    .then((result) => {
      if (result) {
        return foundUser;
      } else {
        throw "Incorrect password";
      }
    });
  // .catch(() => {
  //   console.log("the passwords do not match ");
  //   call compare pass to it the cleartext password and the hash
  //   then we check if our resultsare true or false
  //   if true return the user id
  //   else we return false
  // });

  // 1. Look for a user with the given email
  // 2. If not found, throw an error!
  // 3. Compare the given password with the hashed password of the found user.
  // (use bcrypt!)
  // 4. Resolve
  // - return the found user (need it for adding to the session!)
  // - throw an error if password does not match!
};
module.exports.insertProfileInfo = (url, city, age, userID) => {
  return db.query(
    `INSERT INTO profiles(url,city,age, user_id)
    VALUES($1,$2,$3,$4) 
  ON CONFLICT (user_id)
DO UPDATE SET age = $3, url = $1, city=$2 RETURNING ID;`,
    [url, city, age, userID]
    // 1. Hash the user's password [PROMISE]
    // 2. INSERT into the database with a query
    // 3. Return the entire row
    // so that we can store the user's id in the session!
  );
};

module.exports.getId = (id) => {
  ` SELECT * FROM users
  WHERE $1=id`,
    [id];
};
