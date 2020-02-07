const functions = require('firebase-functions');
const app = require('express')();

const FBAuth = require('./util/FBAuth');

const { getAllPosts, createPost } = require('./handlers/posts');
const { signup, login } = require('./handlers/users');

// Post Routes
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, createPost);

// User Routes
app.post('/signup', signup);
app.post('/login', login);

exports.api = functions.region('europe-west1').https.onRequest(app);
