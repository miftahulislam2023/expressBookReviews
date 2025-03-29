const express = require('express');
const axios = require('axios')
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Mock function to simulate fetching books from an external API
async function fetchBooksFromAPI() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(books);
    }, 1000);
  });
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const bookList = await fetchBooksFromAPI();
    res.status(200).json(bookList);
  } catch (err) {
    res.status(500).json({ message: "Error fetching books", error: err.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  return res.status(200).json(book);
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author.toLowerCase();
    const allBooks = await fetchBooksFromAPI(); // Replace with axios.get() in real case

    const booksByAuthor = Object.values(allBooks)
      .filter(book => book.author.toLowerCase().includes(author));

    if (booksByAuthor.length === 0) {
      return res.status(404).json({
        message: `No books found by author "${req.params.author}"`,
        suggestion: "Try a different author name"
      });
    }

    return res.status(200).json({
      count: booksByAuthor.length,
      books: booksByAuthor
    });

  } catch (err) {
    return res.status(500).json({
      message: "Error fetching books",
      error: err.message
    });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title.toLowerCase();
    const allBooks = await fetchBooksFromAPI();

    const booksByTitle = Object.values(allBooks)
      .filter(book => book.title.toLowerCase().includes(title));

    if (booksByTitle.length === 0) {
      return res.status(404).json({
        message: `No books found containing "${req.params.title}" in the title`,
        suggestion: "Check your spelling or try a different title"
      });
    }

    return res.status(200).json({
      count: booksByTitle.length,
      books: booksByTitle
    });

  } catch (err) {
    return res.status(500).json({
      message: "Error fetching books",
      error: err.message
    });
  }
});

//  Get book review
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const allBooks = await fetchBooksFromAPI();
    const book = allBooks[isbn];

    if (!book) {
      return res.status(404).json({
        message: `Book with ISBN ${isbn} not found`,
        suggestion: "Check the ISBN or browse our collection"
      });
    }

    return res.status(200).json(book);

  } catch (err) {
    return res.status(500).json({
      message: "Error fetching book details",
      error: err.message
    });
  }
});

// Check if a user with the given username already exists
const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!doesExist(username)) {
      // Add the new user to the users array
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register user." });
});

module.exports.general = public_users;
