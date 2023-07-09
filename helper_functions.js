const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const shortURLIDLength = 6;

const generateRandomString = function() {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < shortURLIDLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return null;
}

const urlsForUser = function(id, urlDatabase) {
  const toReturn = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      toReturn[shortURL] = urlDatabase[shortURL];
    }
  }
  return toReturn;
}

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};