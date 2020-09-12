module.exports = {
  ensureAuth: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    req.flash('error_msg', 'Please Login');
    res.redirect('/auth/login');
  },

  ensureGuest: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }

    res.redirect('/posts');
  }
}
