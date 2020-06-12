// finding email iin registered users
const emailFinder = (email, users) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
};

// generating random id
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8)
};


module.exports = { 
  emailFinder,
  generateRandomString
};