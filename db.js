const spicedPg = require("spiced-pg");
const username = "postgres";
const password = "postgres";
const database = "petition";
const db =
  spicedPg(process.env.DATABASE_URL) ||
  spicedPg(`postgres:${username}:${password}@localhost:5432/${database}`);
const bcrypt = require("bcryptjs");

module.exports.getSigners = (city) => {
  console.log("city: ", city);
  if (city != undefined) {
    return db.query(
      `select first, last, age, city, url from users
            join signatures
            on users.id = signatures.user_id
            left outer join profiles
            on users.id = profiles.user_id
            where profiles.city = $1`,
      [city]
    );
  } else {
    return db.query(
      `select first, last, age, city, url from users
            join signatures
            on users.id = signatures.user_id
            left outer join profiles
            on users.id = profiles.user_id;`
    );
  }
};

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
  console.log("id in getSignaturesById", id);

  return db.query(
    `
    SELECT * FROM signatures WHERE id=$1`,
    [id]
  );
};

module.exports.getSignaturesByUserId = (id) => {
  console.log("id in getSignaturesByUserId", id);

  return db.query(
    `
    SELECT signature, users.first,users.last FROM signatures JOIN users ON user_id=users.id WHERE user_id=$1   `,
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

module.exports.authenticateUser = (email, password) => {
  let foundUser;
  return findUserByEmail(email)
    .then((user) => {
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
    })
    .catch(() => {
      console.log("the passwords do not match ");
      //   call compare pass to it the cleartext password and the hash
      //   then we check if our resultsare true or false
      //   if true return the user id
      //   else we return false
    });

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

module.exports.deleteSignature = (userId) => {
  return db.query(`DELETE FROM signatures WHERE user_id=$1 ;`, [userId]);
};

module.exports.UpdateUserProfile = (first, last, email, id) => {
  return db.query(
    `UPDATE users SET first=($1), last=($2), email=($3) WHERE id=($4) RETURNING *`,
    [first, last, email, id]
    // 1. Hash the user's password [PROMISE]
    // 2. INSERT into the database with a query
    // 3. Return the entire row
    // so that we can store the user's id in the session!
  );
};

module.exports.getInfo = (user_id) => {
  return db.query(
    `SELECT first, last, email, age, city, url
    FROM users FULL JOIN profiles on users.
    id=profiles.user_id WHERE users.id=($1)`,
    [user_id]
  );
};

module.exports.updateUserWithPassword = (id, first, last, email, password) => {
  return hashPassword(password).then((hashedPass) => {
    console.log("hashed pass is", hashedPass);
    return db.query(
      `UPDATE users SET first=$2, last=$3, email=$4, password=$5 WHERE id=$1`,
      [id, first, last, email, hashedPass]
    );
  });
};

module.exports.updateUserWithoutPassword = (id, first, last, email) => {
  return db.query(`UPDATE users SET first=$2, last=$3, email=$4 WHERE id=$1`, [
    id,
    first,
    last,
    email,
  ]);
};
