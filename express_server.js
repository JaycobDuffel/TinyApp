// loading the things we need for the server
const bodyParser = require('body-parser');
const cookieSesssion = require('cookie-session');
const express = require('express');
const bcrypt = require('bcrypt');
const helpers = require('./helpers')

const app = express();
const salt = 10
const PORT = 9190;

// set the view engine to ejs
app.set("view engine", "ejs");
// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSesssion({
  name: 'session',
  keys: [
    'helloiamacookie',
    'butyoucannotreadme'],
  maxAge: 24 * 60 * 60 * 1000
}));


const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8)

};
// storing urls created by user
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", user_id: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", user_id: "aJ48lW" }
};

// storing users
const users = {};

const urlsForUser = (id, urls) => {
  let resultURL = {};
  for (const url in urls) {
    if (urls[url]['user_id'] === id) {
      resultURL[url] = urls[url];
    }
  }
  return resultURL;
};




// static GET requests
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.render("urls_new", { users, user_id });
  } else {
    return res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  let templateVars = { users, urls: urlDatabase, user_id, urlsForUser };
  if (users[user_id]) {
    return res.render("urls_index", templateVars);
  } else {
    return res.redirect('/login');
   }
  });

// redirecting from root to url page
app.get("/", (req, res) => {
  res.redirect('/urls');
});

// rendering register template
app.get('/register', (req, res) => {
  const user_id = req.session.user_id;
  if(users[user_id]) {
    return res.redirect('/urls')
  }
  return res.render("register", { users, user_id });
})

app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  if(users[user_id]) {
    return res.redirect('/urls')
  }
  return res.render("login_template", { users, user_id });
})

// dynamic GET requests
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  let templateVars = {
    users,
    user_id,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL']
  };

  if (!users[user_id]) {
    res.send('Please login to edit this url');
  } else {
    if (users[user_id]['id'] !== urlDatabase[shortURL]['user_id']) {
      return res.send('You do not own this url');
    } else if (users[user_id]) {
      res.render("urls_show", templateVars);
    }
  }
});
app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    return res.send('Invalid URL')
  }
 
  const longURL = urlDatabase[shortURL]['longURL'];
  return res.redirect(longURL);

})

// Static POST requests
// clear cookies to logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//creating users
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, salt);
  const email = req.body.email;

  if (!email || !password) {
    return res.status(400).send('please enter a valid email and password')
  }

  let foundUser = helpers.emailFinder(email, users);


  if (foundUser) {
    return res.status(400).send('email taken')
  }
  const newUser = {
    id,
    email,
    hashedPassword
  };
  users[id] = newUser
  req.session.user_id = id;
  console.log(users);
  res.redirect('/urls')
});

// assigning new short url to a long url
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = { 'longURL': req.body.longURL, user_id };
  res.redirect(`/urls/${shortURL}`)
});

// logs user in and redirects to home page
app.post("/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  let foundUser = helpers.emailFinder(email, users)


  if (!foundUser) {
    return res.status(400).send('no user with that email found')
  }

  if (bcrypt.compareSync(password, foundUser.hashedPassword)) {
    req.session.user_id = foundUser.id;
    return res.redirect('/urls');
  }

  return res.status(400).send('incorrect password')
});
// dynamic POST requests
// deleting url 
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  if (user_id === urlDatabase[shortURL]['user_id']) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  }
  return res.send("You can't delete someone elses URL")

});

// sends user to edit page
app.post("/urls/:id", (req, res) => {
console.log('posting ')
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect(`/urls/${req.params.id}`)
  } else {
    return res.redirect('/login');
  }
})

app.post("/urls/:id/update", (req, res) => {
  // updating URL
  urlDatabase[req.params.id]['longURL'] = req.body.longURL;
  res.redirect(`/urls`);
});

// assigning a port for the server to listen on
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

