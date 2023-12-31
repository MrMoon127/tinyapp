const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const shortURLIDLength = 6;

// generates a random string using alphanumeric characters
const generateRandomString = function() {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < shortURLIDLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// takes an email and a database of users and returns a user object
const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return undefined;
};

// returns an object of all the urls that belong to an id given
const urlsForUser = function(id, urlDatabase) {
  const toReturn = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      toReturn[shortURL] = urlDatabase[shortURL];
    }
  }
  return toReturn;
};

const cookieInUse = function(user_id, userDatabase) {
  for (const user in userDatabase) {
    if (user_id === user) {
      return true;
    }
  }
  return false;
}

function isValidURL(string) {
  let url;
  
  try {
    url = new URL(string);
  } catch (e) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
  cookieInUse,
  isValidURL
};