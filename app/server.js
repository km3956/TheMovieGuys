let express = require("express");
let app = express();
let apiFile = require("../env.json");
let apiKey = apiFile["api_key"]; 
let baseUrl = apiFile["api_url"];
let port = 3000;
let hostname = "localhost";
let path = require("path");
app.use(express.static("public"));

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});

app.get('/env.json', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'env.json'));
});

app.post('/login', (req, res) => {

});