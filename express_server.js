const express = require("express");
const app = express();
const PORT = 8080;        // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["i2L375a"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const urlDatabase = {};
const users = {};

//Creates short url
let generateRandomString = () => {
  let random = "";
  let character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  character.split('');
  for (let i = 0; i < 5; i++) {
    random += character.charAt(Math.floor(Math.random() * character.length));
  }
  return random;
};

//Identifies specific users urls
let urlsForUser = (id) => {
  const idUrls = {};
  for (let shortUrl in urlDatabase) {
    if (id === urlDatabase[shortUrl]['userID']) {
      idUrls[shortUrl] = urlDatabase[shortUrl]['url'];
    }
  }
  return idUrls;
};

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Main page with short urls and corresponding long urls for valid user
app.get("/urls", (req, res) => {
  const usersUrls = urlsForUser(req.session.user_id);
  let templateVars = {  urls: usersUrls,
                        user_id: req.session.user_id,
                        user: users[req.session.user_id]
                      };
  res.render("urls_index", templateVars);
});

//Adds a longURL with its created shortURL into the database
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { url: req.body.longURL,
                            userID: req.session.user_id
                          };
  res.redirect("/urls");
});

//Shows login or register for not logged in users
//Logged in user can add a long url which will create a corresponding short url
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {user_id: req.session.user_id,
                        user: users[req.session.user_id]
                      };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Gives logged in user ability to change the long url for selected short url
app.post("/urls/:id/update", (req, res) => {
  if (urlDatabase[req.params.id]['userID'] === req.session.user_id) {
    urlDatabase[req.params.id]['url'] = req.body['longURL'];
    res.redirect("/urls");
  }
});

//Gives logged in user ability to update their short url
//Otherwise error 403
app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL]['url'];
    if (req.session.user_id === urlDatabase[shortURL]['userID']){
    let templateVars = { shortURL: shortURL,
                       longURL: longURL,
                       user_id: req.session.user_id,
                       user: users[req.session.user_id]
                      };
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send('Error, access denied');
  }
});

//Gives logged in user ability to delete their urls
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
});

//Short url  in database redircts to corresponding long url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]['url'];
  res.redirect(longURL);
});


//Page where you create account
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("urls_registration");
});

//Checks user input, creates account and sends cookie if input passes the conditions.
app.post("/register", (req, res) => {
  let emailDoesNotExist = true;
  for (let user in users){
    if (users[user]["email"] === req.body.email) {
      emailDoesNotExist = false;
    }
  }
  if (!req.body.email || !req.body.password ) {
    res.status(400).send('Email or password empty.');
  } else if (!emailDoesNotExist) {
    res.status(400).send('Email is used with an existing account');
  } else {
    const user = generateRandomString();
    users[user] = { id: user,
                    email: req.body.email,
                    hashedpassword: bcrypt.hashSync(req.body.password, 10)
                  };
    req.session.user_id = user;
    res.redirect("/urls");
  }
});


app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("urls_login");
});

//Checks user input, logs in if passes conditions
app.post("/login", (req, res) => {
  for (let user in users){
    if (req.body.email === users[user]['email'] && bcrypt.compareSync(req.body.password, users[user].hashedpassword)) {
      req.session.user_id = user;
      res.redirect("/urls");
      return;
    }
  }
  res.status(403).send('User not found');
});


app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect  ("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
