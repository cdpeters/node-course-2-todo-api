const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

// can't add custom methods to mongoose.model directly, need to create a schema first
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
}, {usePushEach: true});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

// instance methods. Here a function definition (not an arrow function) is used because we need a bound this keyword. For instance methods, the this keyword is bound to the document i.e. user in this case.
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({ _id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens.push({access, token});

  // the second return statement (on user.save()) creates a promise that can be chained onto in the server.js file with a then() call.
  return user.save().then(() => {
    return token;
  });
};

// .statics is an object where anything added on to it becomes a model method. For model methods, the this keyword is bound to the calling model.
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
  }
  // quotes are required when there is a dot (.) in the property
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

// Middleware - predefined by mongoose.
UserSchema.pre('save', function (next) {
  var user = this;

if (user.isModified('password')) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      user.password = hash;
      next();
    });
  });

} else {
  next();
}
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};
