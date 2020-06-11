const emailFinder = (email, users) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
};


module.exports = {emailFinder};