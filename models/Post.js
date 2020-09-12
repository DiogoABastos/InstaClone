const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('./User');
const Notification = require('./Notification');

const postSchema = new Schema({
  body: {
    type: String,
    required: true
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

postSchema.pre('save', async function(next) {
  const post = this;

  if (!post.isNew) {
    return next();
  }

  // create notification for each follower
  const user = await User.findById(post.user);

  const body = `${user.nickname} has created a new post`;

  const followers = user.followers;

  for (let follower of followers) {
    const newNotification = new Notification({
      body,
      from: user,
      to: follower
    });

    await newNotification.save();
  }
});

const postModel = mongoose.model('Post', postSchema);

module.exports = postModel;
