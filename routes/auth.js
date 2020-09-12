const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../models/User');

const { ensureGuest, ensureAuth } = require('../middleware/auth');
const { deleteReadNotifications } = require('../helpers/profile');

router.get('/register', ensureGuest, (req, res) => {
  res.render('auth/register', {
    layout: 'layouts/login'
  });
});

router.get('/login', ensureGuest, (req, res) => {
  res.render('auth/login', {
    layout: 'layouts/login'
  });
});

router.post('/register', ensureGuest, async (req, res) => {
  const { firstName, lastName, nickname, email, password, pass2, status } = req.body;

  // validations
  let errors = [];

  if (!firstName || !lastName || !nickname || !email || !password || !pass2 || !status) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  if (password !== pass2) {
    errors.push({ msg: "Passwords don't match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password needs to be at least 6 characters long" });
  }

  if (errors.length > 0) {
    return res.render('auth/register', {
      layout: 'layouts/login',
      errors,
      firstName,
      lastName,
      nickname,
      email
    });
  }

  try {

    let user = await User.findOne({ email });

    if (user) {
      errors.push({ msg: 'Email already registered' });
    }

    user = await User.findOne({ nickname });

    if (user) {
      errors.push({ msg: 'Nickname already taken' });
    }

    if (errors.length > 0) {
      return res.render('auth/register', {
        layout: 'layouts/login',
        errors,
        firstName,
        lastName
      });
    }

    // No errors

    // register new user
    const newUser = new User({
      firstName,
      lastName,
      nickname,
      email,
      status,
      password
    });

    newUser.save();

    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/auth/login');

  } catch (err) {
    console.log(err);
    res.render('errors/500');
  }
});

router.post('/login', ensureGuest, (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/posts',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', ensureAuth, async (req, res) => {
  await deleteReadNotifications(req, res);

  req.logout();

  req.flash('success_msg', 'You are now logged out');
  res.redirect('/auth/login');
});

module.exports = router;
