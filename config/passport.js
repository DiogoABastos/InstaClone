const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {

      User.findOne({ email: email })
        .then(user => {
          // if there is no user
          if (!user) {
            return done(null, false, { message: 'Wrong Credentials' });
          }

          // if there is a user
          // check for password
          bcrypt.compare(password, user.password, (err, isMatched) => {
            if (err) throw err;

            // password not matched
            if (!isMatched) {
              return done(null, false, { message: 'Wrong Credentials' });
            }

            // passwrod matched
            return done(null, user);
          });
        })
        .catch(err => {
          console.log(err);
        });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
}
