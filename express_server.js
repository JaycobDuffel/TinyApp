// loading the things we need for the server
const bodyParser = require('body-parser')
const express = require('express');
const app = express();
const PORT = 8080; // Default PORT 8080

// set the view engine to ejs
app.set("view engine", "ejs");
// configuring body-parser
app.use(bodyParser.urlencoded({ extended: true }))


const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8)

};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars)
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...

 const shortURL = req.params.shortURL;
 const longURL = urlDatabase[shortURL];
 console.log(longURL)

 res.redirect(longURL)
// res.send("ok")
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}!`);
});