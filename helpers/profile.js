const Notification = require('../models/Notification');

module.exports = {
  ensureProfile: function(req, res, user) {
    if (req.user._id.toString() != user._id.toString() && user.status === 'private' && !req.user.following.includes(user._id)) {
      return res.status(404).json({ success: false });
    }
  },

  deleteReadNotifications: async function(req, res) {
    try {

      const notifications = await Notification.find({ to: req.user._id });

      const read = notifications.filter(notification => notification.read === true);

      read.forEach(notification => {
        notification.remove();
      });

    } catch(err) {
      console.log(err);
    }
  }
}
