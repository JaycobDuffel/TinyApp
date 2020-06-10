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
// storing urls created by user
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// storing users
const users = {
  123: {
    id: 123,
    email: '123@123.com',
    password: "123123"
  }
};


// static GET requests
app.get("/urls/new", (req, res) => {
const user_id = req.cookies["user_id"]

  res.render("urls_new", { users, user_id });
});

app.get("/urls", (req, res) => {
const user_id = req.cookies["user_id"]

  let templateVars = { users, urls: urlDatabase, user_id};
  res.render("urls_index", templateVars);
});

// redirecting from root to url page
app.get("/", (req, res) => {
  res.redirect('/urls');
});

// rendering register template
app.get('/register', (req, res) => {
const user_id = req.cookies["user_id"]

  res.render("register", { users, user_id})
})

app.get("/login", (req, res) => {
const user_id = req.cookies["user_id"]
console.log(users);
  res.render("login_template", { users, user_id })
})

// dynamic GET requests
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars)
});

// Sending user to "longURL" when clicking "shortUrl"
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// Static POST requests

// clear cookies to logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//creating users
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const password = req.body.password;
  const email = req.body.email;

  if (!email || !password) {
    return res.status(400).send('please enter a valid email and password')
  }

  let foundUser; 
  for (const userID in users) {
    if (users[userID].email === email) {
      foundUser = users[userID];
    };  
  }

  if (foundUser) {
    return res.status(400).send('email taken')
  }
  const newUser = {
    id,
    email,
    password
  };
  users[id] = newUser
  res.cookie('user_id', id)
  console.log(users);
  res.redirect('/urls')
});

// assigning new short url to a long url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
});

// logs user in and redirects to home page
app.post("/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  let foundUser;
  for (const userID in users) {
    if (users[userID].email === email) {
      foundUser = users[userID];
    }
  }
  if (!foundUser) {
    return res.status(400).send('no user with that email found')
  }

  if (foundUser.password === password) {
    // correct user
    res.cookie('user_id', foundUser.id);
    return res.redirect('/urls');
  }
  
  return res.status(400).send('incorrect password')
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

// dynamic POST requests

app.post("/urls/:id/update", (req, res) => {
  // updating URL
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

// assigning a port for the server to listen on
app.listen(PORT, () => {
  console.log(`tinyApp listening on port ${PORT}!`);
});