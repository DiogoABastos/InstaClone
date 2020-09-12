const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

const { ensureAuth } = require('../middleware/auth');
const { fullName, instaNickname, followButton } = require('../helpers/ejsHelpers');
const { ensureProfile } = require('../helpers/profile');

router.get('/:id/profile', ensureAuth, async (req, res) => {

  try {

    const user = await User.findById(req.params.id)
      .populate('following', 'followers');


    if (!user) {
      return res.render('errors/404');
    }

    const following = user.following;
    const followers = user.followers;

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user');

    res.render('users/profile', {
      user,
      following,
      followers,
      posts
    });

  } catch(err) {
    console.log(err);
    res.render('errors/500');
  }
});

router.get('/:id/profile/posts', ensureAuth, async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false });
    }

    ensureProfile(req, res, user);

    const posts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user');


    res.status(200).json({ success: true, result: posts });

  } catch(err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

router.get('/:id/profile/likes', ensureAuth, async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false });
    }

    ensureProfile(req, res, user);

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user');

    const likes = posts.filter(post => post.likes.includes(user._id));

    res.status(200).json({ success: true, result: likes });

  } catch(err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

router.get('/:id/profile/followers', ensureAuth, async (req, res) => {
  try {

    const user = await User.findById(req.params.id)
      .populate('followers');

    if (!user) {
      return res.status(404).json({ success: false });
    }

    ensureProfile(req, res, user);

    const followers = user.followers;

    res.status(200).json({ success: true, result: followers });

  } catch(err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

router.get('/:id/profile/following', ensureAuth, async (req, res) => {
  try {

    const user = await User.findById(req.params.id)
      .populate('following');

    if (!user) {
      return res.status(404).json({ success: false });
    }

    ensureProfile(req, res, user);

    const following = user.following;

    res.status(200).json({ success: true, result: following });

  } catch(err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

router.put('/:id/follow', ensureAuth, async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.render('errors/404');
    }

    if (user._id == req.user._id) {
      return res.render('errors/403');
    }

    if (req.user.following.includes(user._id)) {
      return res.render('errors/403');
    }

    // add current user to the followers list
    user.followers.push(req.user._id);

    // add params user to the following list
    req.user.following.push(user._id);

    // save
    await user.save();
    await req.user.save();

    res.redirect(`/users/${user._id}/profile`);

  } catch(err) {
    console.log(err);
    res.render('errors/500');
  }

});

router.delete('/:id/unfollow', ensureAuth, async (req, res) => {
   try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.render('errors/404');
    }

    if (user._id == req.user._id) {
      return res.render('errors/403');
    }

    if (!req.user.following.includes(user._id)) {
      return res.render('errors/403');
    }

    const index = user.followers.indexOf(req.user._id);
    if (index !== -1) {
      user.followers.splice(index, 1);
    }

    const id = req.user.following.indexOf(user._id);
    if (id !== -1) {
      req.user.following.splice(id, 1);
    }

    await user.save();
    await req.user.save();

    res.redirect(`/users/${user._id}/profile`);

   } catch(err) {
    console.log(err);
    res.render('errors/500');
   }
});

router.get('/', ensureAuth, async (req, res) => {

  try {

    const users = await User.find({ "_id": { "$ne": req.user._id } });

    res.render('users/index', {
      users
    });

  } catch(err) {
    console.log(err);
    res.render('errors/500');
  }
});

router.get('/:id/notifications', ensureAuth, async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false });
    }

    if (user._id.toString() != req.user._id.toString()) {
      return res.status(403).json({ success: false });
    }

    const notifications = await Notification.find({ to: user._id })
      .sort({ createdAt: -1 });

    const unread = notifications.filter(notification => notification.read === false);

    res.status(200).json({ success: true, notifications, unread });

  } catch(err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

router.delete('/:userId/notifications/:id/read', ensureAuth, async (req, res) => {
  try {

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false });
    }

    if (user._id.toString() != req.user._id.toString()) {
      return res.staus(403).json({ success: false });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      res.status(404).json({ success: false });
    }

    if (!notification.read) {
      notification.read = true;
      await notification.save();
    }

    res.status(200).json({ success: true, redirect: `/users/${notification.from}/profile` });

  } catch(err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

router.delete('/:id/notifications/read', ensureAuth, async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false });
    }

    if (user._id.toString() != req.user._id.toString()) {
      return res.staus(403).json({ success: false });
    }

    const notifications = await Notification.find({ user: user._id, read: false });

    notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        notification.save();
      }
    });

    res.status(200).json({ success: true });

  } catch(err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

router.get('/:id/edit', ensureAuth, async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.render('errors/404');
    }

    if (user._id.toString() != req.user._id.toString()) {
      return res.render('errors/403');
    }

    const posts = await Post.find({ user: user._id });

    res.render('users/edit', {
      user,
      followers: user.followers,
      following: user.following,
      posts
    });

  } catch(err) {
    console.log(err);
    res.render('error/500');
  }
});

router.put('/:id', ensureAuth, async (req, res) => {
  try {

    const user = await User.findById(req.params.id);
    const posts = await Post.find({ user: user._id });

    if (!user) {
      return res.render('errors/404');
    }

    if (user._id.toString() != req.user._id.toString()) {
      return res.render('errors/403');
    }

    const { firstName, lastName, nickname, city, resume } = req.body;

    const keys = Object.keys(req.body);
    const accept = ['firstName', 'lastName', 'nickname', 'city', 'resume'];

    const errors = [];

    if (!firstName || !lastName || !nickname) {
      errors.push({ msg: 'Please fill in all required fields' });
    }

    for (key of keys) {
      if (!accept.includes(key)) {
        errors.push({ msg:'Invalid input field' });
      }
    }

    if (errors.length > 0) {
      return res.render('users/edit', {
              errors,
              user,
              followers: user.followers,
              following: user.following,
              posts
            });
    }

    for (key of keys) {
      user[key] = req.body[key];
    }

    await user.save();

    res.redirect(`/users/${user._id}/profile`);

  } catch(err) {
    console.log(err);
    res.render('errors/500');
  }
});



module.exports = router;
