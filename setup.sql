--DROP DATABASE IF EXISTS moviesite;
CREATE DATABASE moviesite;
\c moviesite
CREATE TABLE accounts (
	id SERIAL PRIMARY KEY,
	username VARCHAR(15),
	passhash VARCHAR(15)
);