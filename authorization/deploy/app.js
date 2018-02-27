var express = require('express');
var app = express();
var path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('./models/user');
const Note = require('./models/note');
const bodyParser = require('body-parser');
const session = require('express-session');
const requireLogin = require('./require_login');

mongoose.connect(process.env.MONGODB_SERVER);

passport.use(User.createStrategy());
app.use(bodyParser.json());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(session({ secret: process.env.COOKIE_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
// This serves all files placed in the /public
// directory (where gulp will build all React code)
app.use(express.static('public'));

// Also serve everything from our assets directory (static
// assets that you want to manually include)
app.use(express.static('assets'));

// Include your own logic here (so it has precedence over the wildcard
// route below)
app.post('/api/login', passport.authenticate('local'), (req, res) => {
  res.send(req.user);
});

app.post('/api/signup', (req, res, next) => {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
  }); 

  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      res.send(err);
    } else {
      req.logIn(user, (err) => {
        res.send(user);
      });

    }
  });
});

app.get('/api/users', (req, res) => {
    User.find()
      .then((docs) => res.send(docs));
});

app.get('/api/notes/:user_id', (req, res) => {
  Note.find({ author: req.params.user_id })
    .then((doc) => {
      res.status(200).send(doc);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.get('/api/me', (req, res) => {
  if (req.user) {
    res.status(200).send(req.user)
  } else {
    res.status(401).json({ message: "Unauthorized."});
  }
});

app.get('/api/logout', (req, res) => {
  req.logout();
  res.json('User logged out.');
});

const requireEditor = (req, res, next) => {
  if (req.user.role !== 'editor') {
    res.status(401).send("Must be an editor to create posts");
  } else {
    next();
  }
}

app.post('/api/note', requireLogin, requireEditor, (req, res) => {
  const note = new Note(req.body);
  note
    .save()
    .then((doc) => res.status(200).send(doc))
    .catch((err) => {
      console.log(err);
    });
});

app.get('/api/notes', requireLogin, (req, res) => {
  Note.find()
      .then((docs) => {
          res.status(200).send(docs);
      });
});

app.delete('/api/notes/:id', requireLogin, (req, res) => {
  Note.findById(req.params.id)
  .then(note => {
    console.log(typeof(note.author), typeof(req.user._id))
    if (!note.author.equals(req.user._id)) {
      res.status(401).send("You can't delete someone else's notes!")
    } else {
      return note.remove().then(() => res.send('OK'));
    }
  });
})

// This route serves your index.html file (which
// initializes React)
app.get('*', function(req, res, next) {
  res.sendFile(path.join(__dirname,'index.html'));
});

// Start your server, and listen on port 8080.
app.listen(process.env.PORT, function() {
  console.log(`App is now listening on port ${process.env.PORT}!`);
})
