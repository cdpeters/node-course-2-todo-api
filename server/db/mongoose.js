const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// MONGODB_URI came from the mongo lab heroku add-on
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};
