const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const ejsLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

const connectDB = require('./config/db');
const globalVars = require('./middleware/globalVars');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');

// config
require('./config/passport')(passport);
dotenv.config({ path: './config/config.env' });
connectDB();

const app = express();

// ejs helpers
app.locals = require('./helpers/ejsHelpers');

// morgan middleware if in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// static folder
app.use(express.static(path.join(__dirname, 'public')));

// bodyparser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// methodOverride middleware
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

// ejs middleware
app.use(ejsLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');

// session middleware
app.use(session({
  secret: 'thisIsIt',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// flash middleware
app.use(flash());

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// global variables
app.use(globalVars);

// routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.use('/users', usersRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on ${process.env.NODE_ENV} mode on port ${PORT}`));
