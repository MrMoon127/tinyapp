const express = require("express");
const cookieParser = require("cookie-parser")

const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const shortURLIDLength = 6;

app.set("view engine", "ejs");

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
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
})

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
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

app.post("/login", (req, res) => {
  const username = req.body.username;

  res.cookie('username',username);
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

function generateRandomString() {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < shortURLIDLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}