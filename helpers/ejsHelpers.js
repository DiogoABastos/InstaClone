module.exports = {
  fullName: function(firstName, lastName) {
    return `${firstName} ${lastName}`;
  },

  instaNickname: function(nickname) {
    return `@${nickname}`;
  },

  followButton: function(currentUser, user) {
    if (currentUser._id.toString() == user._id.toString()) {
      return '';
    } else {
      if (!currentUser.following.includes(user._id)) {
        return `
        <form action="/users/${user._id}/follow" method="POST">
          <input type="hidden" name="_method" value="PUT" />
          <button type="submit" class="btn btn-primary follow-btn">Follow</button>
        </form>`;
      } else {
        return `
        <form action="/users/${user._id}/unfollow" method="POST">
          <input type="hidden" name="_method" value="DELETE" />
          <button type="submit" class="btn btn-primary follow-btn">Unfollow</button>
        </form>`;
      }
    }
  },

  likeButton: function (currentUser, post) {
    if (post.likes.includes(currentUser._id)) {
      return `<a href="#" data-query="remove/like" class="like-btn"><i class="fas fa-heart red"></i></a>`;
    } else {
      return `<a href="#" data-query="like" class="like-btn"><i class="far fa-heart"></i></a>`;
    }
  },

  city: function (user) {
    return user.city ? user.city : '';
  },

  resume: function(user) {
    return user.resume ? `<p class="resume">${user.resume}</p>` : '';
  }
}
