-- DROP TABLE IF EXISTS signatures;

-- CREATE TABLE signatures (
--      id SERIAL PRIMARY KEY,
--      first VARCHAR NOT NULL CHECK (first != ''),
--      last VARCHAR NOT NULL CHECK (last != ''),
--      signature VARCHAR NOT NULL CHECK (signature != '')
-- );

-- DROP TABLE IF EXISTS signatures;
-- CREATE TABLE signatures (
--      id SERIAL PRIMARY KEY,
    
--      signature VARCHAR NOT NULL CHECK (signature != ''),
--      date TIMESTAMP DEFAULT current_timestamp,
--      user_id INTEGER NOT NULL
-- );
-- DROP TABLE IF EXISTS users;
-- CREATE TABLE users (
--      id serial PRIMARY KEY,
--      first VARCHAR NOT NULL CHECK (first != ''),
--      last VARCHAR NOT NULL CHECK (first != ''),
--      password VARCHAR (60) NOT NULL,
--      email VARCHAR (255) UNIQUE NOT NULL
-- );

DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    first    TEXT NOT NULL CHECK (first <> ''),
    last     TEXT NOT NULL CHECK (last <> ''),
    email         TEXT NOT NULL UNIQUE CHECK (email <> ''),
    password TEXT NOT NULL CHECK (password <> ''),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE signatures (
    id        SERIAL PRIMARY KEY,
    user_id   INTEGER NOT NULL UNIQUE REFERENCES users (id),
    signature TEXT    NOT NULL CHECK (signature != ''),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
    id  SERIAL PRIMARY KEY,
    url VARCHAR,
    city VARCHAR,
    age INT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
