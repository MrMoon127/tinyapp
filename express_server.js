const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

const { generateRandomString, getUserByEmail, urlsForUser } = require("./helper_functions");

app.use(cookieParser());

app.set("view engine", "ejs");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "1"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "2"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.use(express.urlencoded({ extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlsForUser(req.cookies.user_id, urlDatabase)
  };
  if (!templateVars.user) {
    res.send("Please login before accessing URLs")
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.cookies.user_id]
    }
    res.render("urls_new", templateVars);
  }
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL].userID,
      user: users[req.cookies.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Invalid shortURL, does not exist as long URL");
  }
});

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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  if (req.cookies.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.cookies.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("Please login before creating shortURLs");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);

  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("The short URL you put in does not have a long URL to match");
  } else if (!req.cookies.user_id) {
    res.status(401).send("Please login before editing URLs")
  } else {
    res.status(401).send("You do not have the necessary permissions to edit this URL");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);

  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect("/urls");
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("The short URL you put in does not have a long URL to match");
  } else if (!req.cookies.user_id) {
    res.status(401).send("Please login before editing URLs")
  } else {
    res.status(401).send("You do not have the necessary permissions to edit this URL");
  }
});

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
      password: password
    };
    console.log(users[userID].password);
  
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = getUserByEmail(email, users);

  if (userID === null) {
    res.status(403).send("This email is not registered with us, please register or enter a valid email");
  } else if (password !== users[userID].password) {
    res.status(403).send("The password you have entered is incorrect");
  } else {
    res.cookie('user_id', userID);
    res.redirect('/urls');
  }

});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

