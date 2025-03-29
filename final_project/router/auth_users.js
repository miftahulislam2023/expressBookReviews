const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add/Modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // Get review from query parameter
  const username = req.session.username; // Get username from session

  if (!username) {
    return res.status(401).json({ message: "Please login to post a review" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review cannot be empty" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update the review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `Review ${books[isbn].reviews[username] ? 'updated' : 'added'} successfully`,
    book: books[isbn]
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;

  // Check if user is logged in
  if (!username) {
    return res.status(401).json({ message: "Please login to delete a review" });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if book has reviews
  if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }

  // Check if user has a review for this book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "You haven't reviewed this book" });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully!",
    book: books[isbn]  // Return the updated book object
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
