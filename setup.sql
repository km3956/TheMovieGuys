DROP DATABASE IF EXISTS moviesite;
CREATE DATABASE moviesite;
\c moviesite

CREATE TABLE accounts (
	id SERIAL PRIMARY KEY,
	username VARCHAR(15),
	passhash VARCHAR(100)
);

CREATE TABLE friends (
	id SERIAL PRIMARY KEY,
	follower_id INT,
	following_id INT
);

CREATE TABLE reviews (
	id SERIAL PRIMARY KEY,
	movie_id INT,
	account_id INT,
	rating NUMERIC,
	comment TEXT
);

CREATE TABLE queue (
	id SERIAL PRIMARY KEY,
	movie_id INT,
	account_id INT,
	status VARCHAR(8)
);

CREATE TABLE liked (
	id SERIAL PRIMARY KEY,
	movie_id INT,
	account_id INT
);

-- insert test accounts
-- passwords are set as pass1, pass2, ... pass5
INSERT INTO accounts (username, passhash) VALUES ('user1', '$argon2id$v=19$m=65536,t=3,p=4$f1b5KCxGltjsWEeURvt80w$bOsNzmPSqJhDIkFywh014ZuaFTG4l2ahdTnhP2ZsT8A');
INSERT INTO accounts (username, passhash) VALUES ('user2', '$argon2id$v=19$m=65536,t=3,p=4$uvWj+sP5+aWixFZ8Tom0fQ$h21673YD+xg3SFWnd5y/CiC44nUTUoqGMdctEPyXfqc');
INSERT INTO accounts (username, passhash) VALUES ('user3', '$argon2id$v=19$m=65536,t=3,p=4$+lsihuWzOPWmIk83Jecufw$lcS8LKTcIZPZZEAIMAp9uluSD2dS/HSiCSfTRIE36RQ');
INSERT INTO accounts (username, passhash) VALUES ('user4', '$argon2id$v=19$m=65536,t=3,p=4$YFpK2gInXgtvp4wAr3bHbQ$Lc1Cx0mF/1SSJ4k9QYfEcwLoyHzAcL1UqPnV+yiTgOM');
INSERT INTO accounts (username, passhash) VALUES ('user5', '$argon2id$v=19$m=65536,t=3,p=4$l8Iq2cLjqb1aZP923vB2Zw$eGvQgtQG3v4vp5O4e/wX7wNRLrL3PmEXEee7p7i8tYc');

-- add friends to user 1
INSERT INTO friends (follower_id, following_id) VALUES (1, 2);
INSERT INTO friends (follower_id, following_id) VALUES (1, 3);
INSERT INTO friends (follower_id, following_id) VALUES (1, 4);
INSERT INTO friends (follower_id, following_id) VALUES (1, 5);

-- add friends to user 2
INSERT INTO friends (follower_id, following_id) VALUES (2, 1);
INSERT INTO friends (follower_id, following_id) VALUES (2, 3);
INSERT INTO friends (follower_id, following_id) VALUES (2, 4);

-- add friends to user 3
INSERT INTO friends (follower_id, following_id) VALUES (3, 1);
INSERT INTO friends (follower_id, following_id) VALUES (3, 2);

-- add friends to user 4
INSERT INTO friends (follower_id, following_id) VALUES (4, 1);

-- no friends for user 5 for testing

-- add reviews from user1
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (100, 1, 3.6, 'This movie was overall mediocre');
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (200, 1, 4.8, 'Best cinematography I''ve ever seen');

-- add reviews from user2
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (100, 2, 2.1, 'Very boring movie');
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (200, 2, 1.0, 'Worst movie I''ve ever seen');

-- add reviews from user3
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (100, 3, 5.0, 'No better movie exists');
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (200, 3, 2.4, 'I fell asleep while watching');

-- add reviews from user4
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (100, 4, 3.9, 'A solid movie');
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (200, 4, 4.5, 'It was nearly perfect');

-- add reviews from user5
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (100, 5, 3.0, 'Not my favorite, but still decent');
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (200, 5, 3.1, 'Good, but I probably wouldn''t watch it again');

-- add queued movies for user1
INSERT INTO queue (movie_id, account_id, status) VALUES (100, 1, 'Watched');
INSERT INTO queue (movie_id, account_id, status) VALUES (300, 1, 'Watching');
INSERT INTO queue (movie_id, account_id, status) VALUES (400, 1, 'Queue');

-- add queued movies for user2
INSERT INTO queue (movie_id, account_id, status) VALUES (100, 2, 'Watched');
INSERT INTO queue (movie_id, account_id, status) VALUES (200, 2, 'Watched');
INSERT INTO queue (movie_id, account_id, status) VALUES (300, 2, 'Queue');

-- add queued movies for user3
INSERT INTO queue (movie_id, account_id, status) VALUES (100, 3, 'Watched');
INSERT INTO queue (movie_id, account_id, status) VALUES (600, 3, 'Watching');
INSERT INTO queue (movie_id, account_id, status) VALUES (300, 3, 'Queue');

-- add queued movies for user4
INSERT INTO queue (movie_id, account_id, status) VALUES (100, 4, 'Watched');
INSERT INTO queue (movie_id, account_id, status) VALUES (400, 4, 'Queue');
INSERT INTO queue (movie_id, account_id, status) VALUES (500, 4, 'Queue');

-- add queued movies for user5
INSERT INTO queue (movie_id, account_id, status) VALUES (100, 5, 'Watched');
INSERT INTO queue (movie_id, account_id, status) VALUES (400, 5, 'Watching');
INSERT INTO queue (movie_id, account_id, status) VALUES (300, 5, 'Queue');

-- add liked movies for user1
INSERT INTO liked (movie_id, account_id) VALUES (100, 1);
INSERT INTO liked (movie_id, account_id) VALUES (300, 1);

-- add liked movies for user2
INSERT INTO liked (movie_id, account_id) VALUES (200, 2);
INSERT INTO liked (movie_id, account_id) VALUES (300, 2);

-- add liked movies for user3
INSERT INTO liked (movie_id, account_id) VALUES (100, 3);
INSERT INTO liked (movie_id, account_id) VALUES (600, 3);

-- add liked movies for user4
INSERT INTO liked (movie_id, account_id) VALUES (100, 4);
INSERT INTO liked (movie_id, account_id) VALUES (200, 4);

-- add liked movies for user5
INSERT INTO liked (movie_id, account_id) VALUES (200, 5);
INSERT INTO liked (movie_id, account_id) VALUES (400, 5);