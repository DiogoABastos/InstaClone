const profileChoice = document.querySelector('.choices');
const thePosts = document.querySelector('.the-posts');
const currentInfo = document.querySelector('.current-info');
const followingPosts = document.querySelector('.following-posts');

let likes = document.querySelectorAll('.like-btn');

let query;

if (profileChoice && thePosts) {
  // profile Choice
  function displayResult(e) {
    e.preventDefault();

    let target;

    if (e.target.classList.contains('icon')) {
      target = e.target.parentElement;
    } else {
      target = e.target;
    }

    document.querySelector('.selected').classList.remove('selected');

    target.classList.add('selected');

    query = target.dataset.id;

    fetch(`/users/${profileChoice.dataset.id}/profile/${query}`)
      .then(res => res.json())
      .then(data => {
        currentInfo.innerText = capitalize(query);
        if (data.success) {
          display(data.result);
        } else {
          displayPrivate();
        }
      });
  }

  profileChoice.addEventListener('click', displayResult);

  thePosts.addEventListener('click', likePost);
}

if (followingPosts) {

  followingPosts.addEventListener('click', likePost);
}

// like post

function likePost(e) {
  if (e.target.parentElement.classList.contains('like-btn')) {
    e.preventDefault();

    const button = e.target.parentElement;
    const index = e.target.offsetParent.id;
    const query = button.dataset.query;
    const verb = query === 'like' ? 'PUT' : 'DELETE';

    fetch(`/posts/${index}/${query}`, {
      method: verb,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          button.innerHTML = likeButton(data.post);
        }
      });
  }
}

function display(data) {
  if (query === 'posts' || query === 'likes') {
    thePosts.innerHTML = handlePost(data);
  } else if (query === 'following' || query === 'followers') {
    thePosts.innerHTML = handleFollow(data);
  }
}

function displayPrivate() {
  thePosts.innerHTML = templates.private();
}

function handlePost(data) {
  if (data.length > 0) {
    return data.map(element => templates.post(element)).join('');
  } else {
    return templates.noData();
  }
}

function handleFollow(data) {
  if (data.length > 0) {
    return data.map(element => templates.follow(element)).join('');
  } else {
    return templates.noData();
  }
}

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function fullName(data) {
  return `${data.firstName} ${data.lastName}`
}

function nickname(data) {
  return `@${data.nickname}`;
}

function viewProfile(data) {
  return `<a href="/users/${data._id}/profile" class="btn btn-warning new-post">View profile</a>`;
}

function likeButton(post) {
  const current = currentDisplay();
  if (post.likes.includes(current)) {
    return `<a href="#" data-query="remove/like" class="like-btn"><i class="fas fa-heart red"></i></a>`;
  } else {
    return `<a href="#" data-query="like" class="like-btn"><i class="far fa-heart"></i></a>`;
  }
}

function currentDisplay() {
  let current;

  if (profileChoice) {
    current = profileChoice.dataset.current;
  } else if (followingPosts) {
    current = followingPosts.dataset.current;
  }

  return current;
}

const templates = {
  post(data) {
    return `<div class="post" id="${data._id}">
      <div class="info">
        <img src="/imgs/placeholder.jpeg" alt="profile-picture" class="card-photo">
        <p>${fullName(data.user)}</p>
        <i class="fas fa-check-circle verified"></i>
      </div>
      <div class="body">
        ${data.body}
      </div>
      <div class="action">
        <div class="first">
          ${likeButton(data)}
          <i class="far fa-comment"></i>
          <i class="far fa-paper-plane"></i>
        </div>
        <div class="second">
          <i class="far fa-bookmark"></i>
        </div>
      </div>
    </div>`;
  },

  follow(data) {
    return `<div class="post">
      <div class="info">
        <img src="/imgs/placeholder.jpeg" alt="profile-picture" class="card-photo">
        <p>${fullName(data)}</p>
        <i class="fas fa-check-circle verified"></i>
        <span class="follow-nickname">${nickname(data)}</span>
        ${document.querySelector('.choices').dataset.current.toString() == data._id.toString() ? '<i class="far fa-user current-profile"></i>' : viewProfile(data)}
      </div>
    </div>`;
  },

  private() {
    return `<div class="private-profile">
              <i class="fas fa-user-lock lock-user"></i>
              <h3>Private profile</h3>
              <p>Follow this user to see all posts</p>
            </div>
          `;
  },

  noData() {
    return `<div class="private-profile">
              <h3>No Data</h3>
            </div>
            `;
  },

  notifications(data) {
    if (data.read) {
      return `<div id="${data._id}" class="read">
              <a href="#" class="notification">${data.body}</a>
            </div>
            `;
    } else {
      return `<div id="${data._id}">
                <a href="#" class="notification">${data.body}</a>
              </div>
              `;
    }
  },

  noNotifications() {
    return `<div>
              <p>No new notifications</p>
            </div>
            `;
  }

}

function handleNotifications(notifications) {
  if (notifications.length === 0) {
    return templates.noNotifications();
  }

  const templateNotifications = notifications.map(notification => {
    return templates.notifications(notification);
  }).join('');

  return templateNotifications;
}

const notificationBell = document.querySelector('.notification-bell');
const notificationsNumber = document.querySelector('.notifications-number');
const notifications = document.querySelector('.notifications');
const profileBtn = document.querySelector('.profile-btn');

if (notificationBell && profileBtn && notifications) {

  function showNotifications(e) {
    if (e.target.parentElement.classList.contains('notification-bell')) {
      e.preventDefault();
      notifications.classList.toggle('show');
    } else {
      notifications.classList.remove('show');
    }
  }

  function readNotification(e) {
    e.preventDefault();

    if (e.target.classList.contains('notification')) {
      const notification = e.target.parentElement;

      fetch(`/users/${profileBtn.dataset.id}/notifications/${notification.id}/read`, {
        method: 'DELETE',
        heades: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log(data);
          if (data.success) {
            window.location.href = data.redirect;
          }
        });
    }
  }

  function getNotifications() {
    fetch(`/users/${profileBtn.dataset.id}/notifications`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          notificationsNumber.innerText = data.unread.length;
          notifications.innerHTML = handleNotifications(data.notifications);
        }
      });
  }

  getNotifications();

  document.body.addEventListener('click', showNotifications);
  notifications.addEventListener('click', readNotification);
}

