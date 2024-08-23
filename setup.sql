CREATE DATABASE themovieguys;
\c themovieguys
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

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
	tv_id INT,
	account_id INT,
	rating NUMERIC,
	comment TEXT
);

CREATE TABLE queue (
	id SERIAL PRIMARY KEY,
	movie_id INT,
	tv_id INT,
	account_id INT,
	status VARCHAR(8)
);

CREATE TABLE liked (
	id SERIAL PRIMARY KEY,
	movie_id INT,
	tv_id INT,
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
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (533535, 1, 3.6, 'This movie was overall mediocre');
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (200, 1, 4.8, 'Best cinematography I''ve ever seen');

-- add reviews from user2
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (533535, 2, 2.1, 'Very boring movie');
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (200, 2, 1.0, 'Worst movie I''ve ever seen');

-- add reviews from user3
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (533535, 3, 5.0, 'No better movie exists');
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (200, 3, 2.4, 'I fell asleep while watching');

-- add reviews from user4
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (533535, 4, 3.9, 'A solid movie');
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (200, 4, 4.5, 'It was nearly perfect');

-- add reviews from user5
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (533535, 5, 3.0, 'Not my favorite, but still decent');
INSERT INTO reviews (movie_id, account_id, rating, comment) VALUES (200, 5, 3.1, 'Good, but I probably wouldn''t watch it again');

-- add reviews from user1 for tv
INSERT INTO reviews (tv_id, account_id, rating, comment) VALUES (247174, 1, 3.6, 'This tv show was overall mediocre');
INSERT INTO reviews (tv_id, account_id, rating, comment) VALUES (2000, 1, 4.8, 'Best cinematography I''ve ever seen');

-- add reviews from user2 for tv
INSERT INTO reviews (tv_id, account_id, rating, comment) VALUES (247174, 2, 2.1, 'Very boring tv show');
INSERT INTO reviews (tv_id, account_id, rating, comment) VALUES (2000, 2, 1.0, 'Worst tv show I''ve ever seen');

-- add reviews from user3 for tv
INSERT INTO reviews (tv_id, account_id, rating, comment) VALUES (247174, 3, 5.0, 'No better tv show exists');
INSERT INTO reviews (tv_id, account_id, rating, comment) VALUES (2000, 3, 2.4, 'I fell asleep while watching');

-- add reviews from user4 for tv
INSERT INTO reviews (tv_id, account_id, rating, comment) VALUES (247174, 4, 3.9, 'A solid tv show');
INSERT INTO reviews (tv_id, account_id, rating, comment) VALUES (2000, 4, 4.5, 'It was nearly perfect');

-- add reviews from user5 for tv
INSERT INTO reviews (tv_id, account_id, rating, comment) VALUES (247174, 5, 3.0, 'Not my favorite, but still decent');
INSERT INTO reviews (tv_id, account_id, rating, comment) VALUES (2000, 5, 3.1, 'Good, but I probably wouldn''t watch it again');

-- add queued movies for user1
INSERT INTO queue (movie_id, account_id, status) VALUES (533535, 1, 'Watched');
INSERT INTO queue (movie_id, account_id, status) VALUES (718821, 1, 'Watching');
INSERT INTO queue (movie_id, account_id, status) VALUES (519182, 1, 'Queue');

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

-- add queued tv shows for user1
INSERT INTO queue (tv_id, account_id, status) VALUES (237480, 1, 'Watched');
INSERT INTO queue (tv_id, account_id, status) VALUES (8892, 1, 'Watching');
INSERT INTO queue (tv_id, account_id, status) VALUES (223365, 1, 'Queue');

-- add queued tv shows for user2
INSERT INTO queue (tv_id, account_id, status) VALUES (1000, 2, 'Watched');
INSERT INTO queue (tv_id, account_id, status) VALUES (2000, 2, 'Watched');
INSERT INTO queue (tv_id, account_id, status) VALUES (3000, 2, 'Queue');

-- add queued tv shows for user3
INSERT INTO queue (tv_id, account_id, status) VALUES (1000, 3, 'Watched');
INSERT INTO queue (tv_id, account_id, status) VALUES (6000, 3, 'Watching');
INSERT INTO queue (tv_id, account_id, status) VALUES (3000, 3, 'Queue');

-- add queued tv shows for user4
INSERT INTO queue (tv_id, account_id, status) VALUES (1000, 4, 'Watched');
INSERT INTO queue (tv_id, account_id, status) VALUES (4000, 4, 'Queue');
INSERT INTO queue (tv_id, account_id, status) VALUES (5000, 4, 'Queue');

-- add queued tv shows for user5
INSERT INTO queue (tv_id, account_id, status) VALUES (1000, 5, 'Watched');
INSERT INTO queue (tv_id, account_id, status) VALUES (4000, 5, 'Watching');
INSERT INTO queue (tv_id, account_id, status) VALUES (3000, 5, 'Queue');

-- add liked movies for user1
INSERT INTO liked (movie_id, account_id) VALUES (718821, 1);
INSERT INTO liked (movie_id, account_id) VALUES (157336, 1);
INSERT INTO liked (movie_id, account_id) VALUES (64690, 1);
INSERT INTO liked (movie_id, account_id) VALUES (584, 1);
INSERT INTO liked (movie_id, account_id) VALUES (6977, 1);
INSERT INTO liked (movie_id, account_id) VALUES (522627, 1);

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

-- add liked tv shows for user1
INSERT INTO liked (tv_id, account_id) VALUES (1405, 1);
INSERT INTO liked (tv_id, account_id) VALUES (76479, 1);
INSERT INTO liked (tv_id, account_id) VALUES (46952, 1);
INSERT INTO liked (tv_id, account_id) VALUES (88803, 1);
INSERT INTO liked (tv_id, account_id) VALUES (97400, 1);
INSERT INTO liked (tv_id, account_id) VALUES (236235, 1);

-- add liked tv shows for user2
INSERT INTO liked (tv_id, account_id) VALUES (2000, 2);
INSERT INTO liked (tv_id, account_id) VALUES (3000, 2);

-- add liked tv shows for user3
INSERT INTO liked (tv_id, account_id) VALUES (1000, 3);
INSERT INTO liked (tv_id, account_id) VALUES (6000, 3);

-- add liked tv shows for user4
INSERT INTO liked (tv_id, account_id) VALUES (1000, 4);
INSERT INTO liked (tv_id, account_id) VALUES (2000, 4);

-- add liked tv shows for user5
INSERT INTO liked (tv_id, account_id) VALUES (2000, 5);
INSERT INTO liked (tv_id, account_id) VALUES (4000, 5);