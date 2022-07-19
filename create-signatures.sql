-- DROP TABLE IF EXISTS signatures;

-- CREATE TABLE signatures (
--      id SERIAL PRIMARY KEY,
--      first VARCHAR NOT NULL CHECK (first != ''),
--      last VARCHAR NOT NULL CHECK (last != ''),
--      signature VARCHAR NOT NULL CHECK (signature != '')
-- );

DROP TABLE IF EXISTS signatures;
CREATE TABLE signatures (
     id SERIAL PRIMARY KEY,
    
     signature VARCHAR NOT NULL CHECK (signature != ''),
     date TIMESTAMP DEFAULT current_timestamp,
     user_id INTEGER NOT NULL
);
DROP TABLE IF EXISTS users;
CREATE TABLE users (
     id serial PRIMARY KEY,
     first VARCHAR NOT NULL CHECK (first != ''),
     last VARCHAR NOT NULL CHECK (first != ''),
     password VARCHAR (60) NOT NULL,
     email VARCHAR (255) UNIQUE NOT NULL
);