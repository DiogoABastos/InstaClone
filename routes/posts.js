const express = require('express');
const router = express.Router();

const Post = require('../models/Post');
const User = require('../models/User');

const { ensureAuth } = require('../middleware/auth');

router.get('/', ensureAuth, async (req, res) => {

  try {

  const user = await User.findById(req.user._id)
    .populate('following');

  const followees = user.following;

  const posts = await Post.find({ user: followees })
    .sort({ createdAt: -1 })
    .populate('user');

  res.render('posts/index', {
    posts,
    user
  });

  } catch(err) {
    console.log(err);
    res.render('errors/500');
  }
});

router.get('/new', ensureAuth, (req, res) => {
  res.render('posts/new');
});

router.post('/', ensureAuth, async (req, res) => {
  try {

    const { body } = req.body;

    let errors = [];

    if (!req.body.body) {
      errors.push({ msg: 'You forgot to write your post' });
    }

    if (errors.length > 0) {
      return res.render('posts/new', {
        errors
      });
    }

    const newPost = new Post({
      body: body,
      user: req.user._id
    });

    await newPost.save();

    res.redirect(`/users/${req.user._id}/profile`);

  } catch(err) {
    console.log(err);
    res.render('errors/500');
  }
});

router.put('/:id/like', ensureAuth, async (req, res) => {
  try {

    const post = await Post.findById(req.params.id)
      .populate('user');

    if (!post) {
      return res.status(404).json({ success: false });
    }

    if (post.likes.includes(req.user._id)) {
      return res.status(403).json({ success: false });
    }

    if (post.user._id.toString() != req.user._id.toString() && post.user.status === 'private' && !req.user.following.includes(post.user._id)) {
      return res.status(403).json({ success: false });
    }

    // like the post
    post.likes.push(req.user._id);

    await post.save();

    res.status(200).json({ success: true, post });

  } catch(err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

router.delete('/:id/remove/like', ensureAuth, async (req, res) => {
  try {

    const post = await Post.findById(req.params.id)
      .populate('user');

    if (!post) {
      return res.status(404).json({ success: false });
    }

    if (!post.likes.includes(req.user._id)) {
      return res.status(403).json({ success: false });
    }

    // remove like from post
    const id = post.likes.indexOf(req.user._id);
    if (id !== -1) {
      post.likes.splice(id, 1);
    }

    await post.save();

    res.status(200).json({ success: true, post });

  } catch(err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
