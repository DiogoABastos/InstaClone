module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://thisUser:thisUserPass@appcluster.rjdlu.mongodb.net/<dbname>?retryWrites=true&w=majority',
  PORT: process.env.PORT || 3000
}
