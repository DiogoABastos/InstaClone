const mongoose = require('mongoose');

const User = require('../models/User');
const Post = require('../models/Post');

const connectDB = require('./db');

const user = async (name) => {
  try {

    const user = await User.findOne({ nickname: name });
    return user._id;

  } catch(err) {
    console.log(err);
  }
}

const createPosts = async () => {
  try {

    const mike_litoris = await user('mike_litoris');
    const mike_hoxlong = await user('mike_hoxlong');
    const mike_hunt = await user('mike_hunt');
    const ben_dover = await user('ben_dover');

    return [
      {
        body: 'This is my first Post',
        likes: [mike_litoris, mike_hoxlong],
        user: mike_litoris
      },
      {
        body: 'This is my first Post',
        likes: [mike_hunt, mike_litoris, mike_hoxlong],
        user: mike_litoris
      },
      {
        body: 'This is my first Post',
        likes: [],
        user: mike_litoris
      },
      {
        body: 'This is my first Post',
        likes: [],
        user: mike_hunt
      },
      {
        body: 'This is my first Post',
        likes: [],
        user: mike_hunt
      },
      {
        body: 'This is my first Post',
        likes: [],
        user: mike_hunt
      },
      {
        body: 'This is my first Post',
        likes: [],
        user: mike_hoxlong
      },
      {
        body: 'This is my first Post',
        likes: [],
        user: mike_hoxlong
      },
      {
        body: 'This is my first Post',
        likes: [],
        user: ben_dover
      },
      {
        body: 'This is my first Post',
        likes: [],
        user: ben_dover
      }
    ];

  }catch(err) {
    console.log(err);
  }
}

createPostsSeeds = async () => {
  try {

    const posts = await createPosts();

    for (let i = 0; i < posts.length; i++) {
      const newPost = new Post(posts[i]);
      await newPost.save();
    }

  } catch (err) {
    console.log(err);
  }
}

module.exports = createPostsSeeds;
