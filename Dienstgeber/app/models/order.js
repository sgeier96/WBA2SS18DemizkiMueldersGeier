var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var OrderSchema = new Schema({
    name: String,
    orderNumber: Number                                                         // Auftragsnummer
//    username: String,                                                         // Publish-Subscribe
//    ???                                                                       // Es muss auch unbedingt auf die Ressource verweise!
});

module.exports = mongoose.model('Order', OrderSchema);
