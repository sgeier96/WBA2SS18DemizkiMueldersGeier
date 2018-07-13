var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CartSchema = new Schema({
    username: String,
    orderID: String,
    links: [{
        productID : String,
        rel: String,
        method: String,
        title: String,
        href: String
      }]                                                                        
});

module.exports = mongoose.model('Cart', CartSchema);
