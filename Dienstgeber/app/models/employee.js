var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EmployeeSchema = new Schema({
    name: String,
    surname: String,
    address: String,
    age: Number,
    username: String,
    password: String,
    rank: String,
    approval: String,
    orderID: String
});

module.exports = mongoose.model('Employee', EmployeeSchema);
