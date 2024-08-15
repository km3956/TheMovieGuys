let express = require("express");
let app = express();
let env = require("../env.json");
let apiKey = env["api_key"]; 
let baseUrl = env["api_url"];
let port = 3000;
let hostname = "localhost";
let path = require("path");

app.use(
  express.static(path.join(__dirname, "../node_modules/bootstrap/dist/"))
);

let argon2 = require("argon2");
let cookieParser = require("cookie-parser");
let cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "strict",
};

let tokenStorage = {};
let crypto = require("crypto");
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

let pg = require("pg");
let Pool = pg.Pool;
let pool = new Pool(env.db);
pool.connect().then(function () {
  console.log(`Connected to database ${env.db.database}`);
});

function validateCredentials(body) {
  // body structure validation
  if (
    !body.hasOwnProperty("username") ||
    !body.hasOwnProperty("password")
  ) {
    return false;
  }

  let { username, password } = body;

  // username and password validation
  if (
    username.length < 1 ||
    username.length > 15 ||
    password.length < 1 ||
    password.length > 15
  ) {
    return false;
  }

  return true;
}

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});

app.get('/env.json', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'env.json'));
});

app.post('/create', async (req, res) => {
  let body = req.body;
  console.log(body);

  if (!validateCredentials(body)) {
    return res.status(400).send("Body structure error");
  }

  let { username, password } = body;

  // check for username match
  let selectResult;
  try {
    selectResult = await pool.query("SELECT id FROM accounts WHERE username = $1", [username]);
  } catch (error) {
    console.log("SELECT FAILED", error);
    return res.status(500).end();
  }

  if (selectResult.rows.length !== 0) {
    return res.status(400).send("Username already taken");
  }

  // hash password
  let passhash;
  try {
    passhash = await argon2.hash(password);
  } catch (error) {
    console.log("HASH FAILED", error);
    res.status(500).end();
  }

  // insert new account into db
  let insertResult;
  try {
    insertResult = await pool.query("INSERT INTO accounts (username, passhash) VALUES ($1, $2)", [username, passhash]);
  } catch (error) {
    console.log("INSERT FAILED", error);
    res.status(500).end();
  }

  // automatically sign in user after successful account creation
  let token = generateToken();
  console.log("Token: ", token);
  tokenStorage[token] = username;
  return res.cookie("token", token, cookieOptions).send("Account creation successful");
});

app.post('/login', async (req, res) => {
  let body = req.body;
  console.log(body);

  if (!validateCredentials(body)) {
    return res.status(400).send("Body structure error");
  }

  let { username, password } = body;

  // check for user account
  let result;
  try {
    result = await pool.query("SELECT passhash FROM accounts WHERE username = $1", [username]);
  } catch (error) {
    console.log("SELECT FAILED", error);
    return res.status(500).end();
  }

  if (result.rows.length === 0) {
    return res.status(400).send("Account not found");
  }

  // verify account password
  let passhash = result.rows[0].passhash;
  let isVerified;
  try {
    isVerified = await argon2.verify(passhash, password);
  } catch (error) {
    console.log("VERIFICATION FAILED", error);
    return res.status(500).end();
  }

  // incorrect password
  if (!isVerified) {
    return res.status(400).send("Incorrect password");
  }

  // make token for user
  let token = generateToken();
  console.log("Token: ", token);
  tokenStorage[token] = username;
  return res.cookie("token", token, cookieOptions).send("Login successful");
});

// for reviews on movie landing page
async function getMovieReviews(movieId, username) {
  try {
    let friendQuery = await pool.query(`
      SELECT r.id, a.username AS author, r.rating, r.comment 
      FROM reviews r 
      JOIN accounts a ON r.account_id = a.id 
      WHERE r.movie_id = $1
        AND r.account_id IN (
          SELECT following_id 
          FROM friends 
          WHERE follower_id = (
            SELECT id 
            FROM accounts 
            WHERE username = $2
          )
        )
    `, [movieId, username]);

    let nonfriendQuery = await pool.query(`
      SELECT r.id, a.username AS author, r.rating, r.comment 
      FROM reviews r 
      JOIN accounts a ON r.account_id = a.id 
      WHERE r.movie_id = $1
        AND r.account_id NOT IN (
          SELECT following_id 
          FROM friends 
          WHERE follower_id = (
            SELECT id 
            FROM accounts 
            WHERE username = $2
          )
        )
    `, [movieId, username]);

    let result = friendQuery.rows.concat(nonfriendQuery.rows);
    return result;
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}

app.get('/movie', async (req, res) => {
  let movieId = req.query.id;
  let username = "";
  if (tokenStorage[req.cookies.token]) {
    username = tokenStorage[req.cookies.token];
  }
  if (!movieId) {
      return res.status(400).send("Movie ID is required");
  }
  try {
      let reviews = await getMovieReviews(movieId, username);
      res.json(reviews);
  } catch (error) {
      res.status(500).send("Error fetching reviews");
  }
});

async function getTVReviews(tvID) {
  try {
      let result = await pool.query(`
          SELECT r.id, a.username AS author, r.rating, r.comment
          FROM reviews r
          JOIN accounts a ON r.account_id = a.id
          WHERE r.tv_id = $1`, [tvID]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
    }
    
}

app.get('/tv', async (req, res) => {
  let tv = req.query.id;
  if (!tv) {
      return res.status(400).send("TV ID is required");
  }
  try {
      let reviews = await getTVReviews(tv);
      res.json(reviews);
  } catch (error) {
      res.status(500).send("Error fetching reviews");
  }
});