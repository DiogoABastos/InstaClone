const mongoose = require('mongoose');

const { MONGO_URI } = require('./keys');

module.exports = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });

    console.log('MongoDB connected');

  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}
