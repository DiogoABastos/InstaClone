const mongoose = require('mongoose');

const connectDB = require('./db');

const userSeed = require('./userSeeds');
const postSeed = require('./postSeeds');

function exit() {
  mongoose.disconnect();
}

const createSeeds = async () => {
  try {

    await connectDB();
    console.log('Seeding Database...')
    await userSeed();
    await postSeed();
    console.log('Database Seeded');

    exit();

  } catch(err) {
    console.log(err);
  }

}

createSeeds();
