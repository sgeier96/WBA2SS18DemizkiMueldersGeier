var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CartSchema = new Schema({
    username: String,
    orderID: String,
    links: [{
        rel: String,
        method: String,
        title: String,
        href: String
      }]                                                                        // Möglicherweise Code für die einzelnen Produkte.
});

module.exports = mongoose.model('Cart', CartSchema);
