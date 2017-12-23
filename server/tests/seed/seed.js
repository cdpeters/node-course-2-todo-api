const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'userOne@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'userTwo@example.com',
  password: 'userTwoPass'
}];

const populateUsers = (done) => {
  User.remove({}).then(() => {
    // the call to .save() makes sure we run the middleware that encrypts password
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    // Promise.all() takes an array of promises, returning this essentially creates a promise that is only resolved once each promise in the array is resolved. A then() call can then be tacked on outside of the first then() call.
    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

module.exports = {users, populateUsers, todos, populateTodos};
