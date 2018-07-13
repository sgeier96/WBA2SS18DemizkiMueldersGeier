var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ProductSchema = new Schema({
    name: String,
    number: Number,                                                             // Anzahl
    barcode: Number,
    class: String
});

module.exports = mongoose.model('Product', ProductSchema);
