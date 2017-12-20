const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// these are all mongoose methods.
// remove() does not give us the documents back, it simply removes them
// Todo.remove({}).then((result) => {
//   console.log(result);
// });

// findOneAndRemove() removes the doc and returns the document
// Todo.findOneAndRemove({})


Todo.findByIdAndRemove('5a3aaf9ec3add9ee62792b09').then((todo) => {
  console.log(todo);
});
