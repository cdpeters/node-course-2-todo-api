// library imports
const express = require('express');
const bodyParser = require('body-parser');

// local imports
const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

var app = express();

app.use(bodyParser.json());

// resource creation
app.post('/todos', (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});


// resource reading: GET /todos


app.listen(3000, () => {
  console.log('Started on port 3000');
});

module.exports = {app};

// CRUD operations:
  // - create
  // - read
  // - update
  // - delete


// var newTodo = new Todo({
//   text: 'Cook dinner'
// });

// newTodo.save().then((doc) => {
//   console.log('Saved todo', doc);
// }, (e) => {
//   console.log('Unable to save todo');
// });

// **** mongoose does typecast, numbers or booleans can be turned into a string
// var newTodo2 = new Todo({
//   text: true
// });

// newTodo2.save().then((doc) => {
//   console.log(JSON.stringify(doc, undefined, 2));
// }, (e) => {
//   console.log('Unable to save todo', e);
// });
