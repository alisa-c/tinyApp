const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


//shows the long urls in the database
app.get("/urls", (req, res) => {
  let templateVars = {  urls: urlDatabase,
                        user_id: req.cookies["user_id"],
                        user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

//adds a longURL with its created shortURL into the database
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls/");
});

//page where you create account
app.get("/register", (req, res) => {
  res.render("urls_registration");
});

//page where you add url
app.get("/urls/new", (req, res) => {
  let templateVars = {user_id: req.cookies["user_id"],
                       user: users[req.cookies["user_id"]]
                     };
  res.render("urls_new", templateVars);
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body['longURL']
  res.redirect("/urls");
});

//shows the corresponding longURL to the shortURL (id)
app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id]
  let templateVars = { shortURL: req.params.id,
                       longURL: longURL,
                       user_id: req.cookies["user_id"],
                       user: user[req.cookies["user_id"]]
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

app.post("/register", (req, res) => {
  let emailDoesNotExist = true;
  for (user in users){
    if (users[user]["email"] === req.body.email) {
      emailDoesNotExist = false;
    }
  }
  if (!req.body.email || !req.body.password ) {
    res.status(400).send('email or password empty.');
  } else if (!emailDoesNotExist) {
    res.status(400).send('Email is used with an existing account');
  } else {
    const user = generateRandomString()
    users[user] = { id: user,
                    email: req.body.email,
                    password: req.body.password
                  }
  }
  res.cookie("user_id", user);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  for (user in users){
    if (req.body.email === users[user]["email"] && req.body.password === users[user]["password"]) {
      res.cookie("user_id", user); // this doesnt work check it out cookieParser(req.body)
      res.redirect("/urls");
    }
  }
  res.status(403).send('user not found');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls/new");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

