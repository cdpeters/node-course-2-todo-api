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

// .toJSON() is called internally by JSON.stringify() which is called internally by res.send(). Here we customize toJSON() so that during the conversion to a JSON string, only specific key-value pairs are output to the response that gets sent to the client.
UserSchema.methods.toJSON = function () {
  var user = this;
  // .toObject() takes the mongoose user object (the one that also has a __v property) and creates an object that only has the properties from the model (and the _id that was created during the save).
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

UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

// .statics is an object where anything added on to it becomes a model method. For model methods, the this keyword is bound to the calling model.
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  // any errors in the throw block will stop execution of that block and pass the error to the catch block.
  try {
    // returns the payload of a JWT (JSON Web Token) which includes
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
  }
  // quotes are required when there is a dot (.) in the property. The quotes on _id is just used for a consistent look but are not actually required.
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': decoded.access
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) =>{
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

// Middleware - .pre() is predefined by mongoose as middleware that occurs before the action in the first argument, in this case a 'save' action. Bcrypt is used specifically for encrypting (hashing and salting) passwords
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
