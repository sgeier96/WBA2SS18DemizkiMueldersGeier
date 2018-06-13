var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EmployeeSchema = new Schema({
    name: String,
    surname: String,
    address: String,
    age: Number,
    username: String,
    password: String
    //employee_id: Number                                                       // Für POST Abfrage, falls dieselbe Person erstellt wird.
});

module.exports = mongoose.model('Employee', EmployeeSchema);
