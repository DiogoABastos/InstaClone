const mongoose = require('mongoose');
const User = require('../models/User');

function createUsers(userIds) {
  return [
    {
      firstName: 'Mike',
      lastName: 'Litoris',
      nickname: 'mike_litoris',
      email: 'mike_litoris@gmail.com',
      status: 'public',
      password: '123456'
    },
    {
      firstName: 'Mike',
      lastName: 'Hoxlong',
      nickname: 'mike_hoxlong',
      email: 'mike_hoxlong@gmail.com',
      status: 'private',
      password: '123456'
    },
    {
      firstName: 'Mike',
      lastName: 'Hunt',
      nickname: 'mike_hunt',
      email: 'mike_hunt@gmail.com',
      status: 'public',
      password: '123456'
    },
    {
      firstName: 'Ben',
      lastName: 'Dover',
      nickname: 'ben_dover',
      email: 'ben_dover@gmail.com',
      status: 'private',
      password: '123456'
    }
  ];
}

createUserSeeds = async () => {
  try {

    User.collection.drop();

    const users = createUsers();

    for (let i = 0; i < users.length; i++) {
      const newUser = new User(users[i]);
      await newUser.save();
    }

  } catch(err) {
    console.log(err);
  }
}

module.exports = createUserSeeds;


