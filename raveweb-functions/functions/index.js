const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
const serviceAcc = require('./secret.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAcc),
  databaseURL: 'https://raveweb-7ff67.firebaseio.com'
});

const config = {
  apiKey: 'AIzaSyD-ITBXZXBjTK0HRZ3gFsDz_IkNrm9-oJ4',
  authDomain: 'raveweb-7ff67.firebaseapp.com',
  databaseURL: 'https://raveweb-7ff67.firebaseio.com',
  projectId: 'raveweb-7ff67',
  storageBucket: 'raveweb-7ff67.appspot.com',
  messagingSenderId: '518492986936',
  appId: '1:518492986936:web:9a3ddd8f99f02e51ea10cd',
  measurementId: 'G-HSRJHFQ2XF'
};

const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();

app.get('/posts', (req, res) => {
  db.collection('posts')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let posts = [];
      data.forEach(doc => {
        posts.push({
          postId: doc.id,
          ...doc.data()
        });
      });
      return res.json(posts);
    })
    .catch(err => console.error(err));
});

app.post('/post', (req, res) => {
  const newPost = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db.collection('posts')
    .add(newPost)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: 'Somethin went wrong' });
      console.error(err);
    });
});

// Sign up
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  // TODO validate data
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({});
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already in use' });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.region('europe-west1').https.onRequest(app);
