// loading the things we need for the server
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const PORT = 8080; // Default PORT 8080

// set the view engine to ejs
app.set("view engine", "ejs");
// configuring body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8)

};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  res.render("urls_new", {username: req.cookies["username"]});
});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars)
})
app.get("/", (req, res) => {
  // redirecting from root to url page
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  res.render("login_template", {username: req.cookies["username"]})
})

app.post('/logout', (req, res) => {
  // clear cookies to logout
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
});


// deleting url 
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

// sends user to edit page
app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`)
});

//logs user in and redirects to home page
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  // updating URL
urlDatabase[req.params.id] = req.body.longURL;
res.redirect(`/urls/${req.params.id}`)
})

app.get("/u/:shortURL", (req, res) => {

 const shortURL = req.params.shortURL;
 const longURL = urlDatabase[shortURL];
 console.log(longURL)

 res.redirect(longURL)

  
});

app.listen(PORT, () => {
  console.log(`tinyApp listening on ${PORT}!`);
});