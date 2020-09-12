const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

const notificationSchema = new Schema({
  body: {
    type: String,
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const notificationModel = mongoose.model('Notification', notificationSchema);

module.exports = notificationModel;
