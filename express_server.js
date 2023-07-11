const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

const { generateRandomString, getUserByEmail, urlsForUser, cookieInUse } = require("./helper_functions");

app.use(cookieSession({
  name: 'session',
  keys:['SASHA'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");

const users = {};

const urlDatabase = {};

app.use(express.urlencoded({ extended: true}));

// the basis, directs to a login page or users urls
app.get("/", (req, res) => {
  if (cookieInUse(req.session.user_id, users)) {
    res.redirect("/urls")
  } else {
    res.redirect("/login");
  }
});


// displays urls
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

// page to create new urls
app.get("/urls/new", (req, res) => {
  if (!cookieInUse(req.session.user_id, users)) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

// page to register a new email
app.get("/register", (req, res) => {
  if (cookieInUse(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_registration", templateVars);
  }
});

// page to login
app.get("/login", (req, res) => {
  if (cookieInUse(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_login", templateVars);
  }
});

// shows the editing page for the shortURL given
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL].userID,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Invalid shortURL, does not exist as long URL");
  }
});

// directs to the website based off of the short URL given
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The short URL you have put in does not have a long URL to match");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// redirects to the URL clicked on
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("Please login before creating shortURLs");
  }
});

// deletes the short url clicked on
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);

  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("The short URL you put in does not have a long URL to match");
  } else if (!req.session.user_id) {
    res.status(401).send("Please login before editing URLs");
  } else {
    res.status(401).send("You do not have the necessary permissions to edit this URL");
  }
});

// changes the associated longURL of a shortURL
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);

  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect("/urls");
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("The short URL you put in does not have a long URL to match");
  } else if (!req.session.user_id) {
    res.status(401).send("Please login before editing URLs");
  } else {
    res.status(401).send("You do not have the necessary permissions to edit this URL");
  }
});

// adds the email and password to the userDatabase
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    res.status(400).send("Invalid email or password");
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("Email address already in use. Please enter another email");
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };
  
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

// determines validity of login info, then redirects to /urls
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = getUserByEmail(email, users);

  if (userID === undefined) {
    res.status(403).send("This email is not registered with us, please register or enter a valid email");
  } else if (!bcrypt.compareSync(password, users[userID].password)) {
    res.status(403).send("The password you have entered is incorrect");
  } else {
    req.session.user_id = userID;
    res.redirect('/urls');
  }

});

// logs user out and clears cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

