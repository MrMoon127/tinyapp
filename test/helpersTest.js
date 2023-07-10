const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helper_functions');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  a92ibL: {
    longURL: "https://everythinggames.ca",
    userID: "cv8zA9",
  },
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    assert(user === expectedUserID, "User ID's match");
  })
  it('should return undefined if we pass an email not in our database', function() {
    const user = getUserByEmail("sasha.andia@gmail.com", testUsers);
    const expectedOutput = undefined;

    assert(user === expectedOutput, "Returns undefined");
  })
})

describe('urlsForUser', function() {
  it('should return an object of objects correlating to all urls that belong to a userID', function() {
    const userUrls = urlsForUser("aJ48lW", testDatabase);
    const expectedOutput = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
      },
    };

    assert.deepEqual(userUrls, expectedOutput, "user URLs are as expected");
  })
  it('should return an empty object if the id does not have any URLs saved', function() {
    const userUrls = urlsForUser("S8czx6", testDatabase);
    const expectedOutput = {};

    assert.deepEqual(userUrls, expectedOutput, "Returns an empty object");
  })
})