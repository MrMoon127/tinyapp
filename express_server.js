const express = require("express");
const cookieParser = require("cookie-parser")
const app = express();
const PORT = 8080; // default port 8080

const { generateRandomString, getUserByEmail } = require("./helper_functions")

app.use(cookieParser());

app.set("view engine", "ejs");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
})

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_registration", templateVars)
})

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    id: req.params.id, 
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id];
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The short URL you have put in does not have a long URL to match");
  }
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let long = req.body['longURL'];
  let short = generateRandomString();
  urlDatabase[short] = long;
  res.redirect(`/urls/${short}`);
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newURL;
  res.redirect('/urls');
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString();

  if (!email || !password) {
    res.status(400).send("Invalid email or password");
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("Email address already in use. Please enter another email")
  } else {
    users[userID] = {
      id: userID,
      email,
      password
    };
  
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
})

app.post("/login", (req, res) => {
  const username = req.body.username;

  res.cookie('username',username);
  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

