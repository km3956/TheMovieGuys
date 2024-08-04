let express = require("express");
let app = express();
let env = require("../env.json");
let apiKey = env["api_key"]; 
let baseUrl = env["api_url"];
let port = 3000;
let hostname = "localhost";
let path = require("path");

let pg = require("pg");
let Pool = pg.Pool;
let pool = new Pool(env.db);
pool.connect().then(function () {
  console.log(`Connected to database ${env.db.database}`);
});

app.use(express.static("public"));
app.use(express.json());

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});

app.get('/env.json', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'env.json'));
});

app.post('/login', (req, res) => {
  let body = req.body;
  console.log(body);

  if (
    !body.hasOwnProperty("username") ||
    !body.hasOwnProperty("password")
  ) {
    return res.status(400).end();
  }

  let username = body.username;
  let password = body.password;

  if (
    username.length < 1 ||
    username.length > 15 ||
    password.length < 1 ||
    password.length > 15
  ) {
    return res.status(400).end();
  }

  // implement a hashing of user passwords later
  //let passhash = hash(body.password);

  let text = `SELECT username, passhash FROM accounts WHERE username=\'${username}\'`;
  pool.query(text).then(result => {
    if (result.rows.length === 0) {
      res.status(400).end();
    }
    else {
      let account = result.rows[0];
      console.log(account);
      if (password !== account.passhash) {
        res.status(400).end();
      }
      else {
        res.status(200).end();
      }
    }
  });
});