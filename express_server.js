const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");

//creates random 6 character for the shorturl
function generateRandomString() {
  let random = "";
  let character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  character.split('');
  for (let i = 0; i < 5; i++) {
    random += character.charAt(Math.floor(Math.random() * character.length));
  }
  return random;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

//shows the long urls in the database
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//adds a longURL with its created shortURL into the database
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls/");
});

//page where you add url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body['longURL']
  res.redirect("/urls");
});

//shows the corresponding longURL to the shortURL (id)
app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id]
  let templateVars = { shortURL: req.params.id,
                        longURL: longURL
                      }
  res.render("urls_show", templateVars);
});

//finds given shortURL if in database redircts to corresponding longURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


