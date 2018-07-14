var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var OrderSchema = new Schema({
    orderName: String,
    description: String,
    username: String,
    products: [{
        productID : String,
        productName: String,
        productClass: String,
        method: String,
        href: String
      }]
                                                               // Publish-Subscribe?

});

module.exports = mongoose.model('Order', OrderSchema);
