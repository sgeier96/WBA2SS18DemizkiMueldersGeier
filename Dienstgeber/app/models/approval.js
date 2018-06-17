var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ApprovalSchema = new Schema({
    name: String,
    username: String,                                                           // Hier muss noch überlegt werden, wie die Genehmigung funktionieren soll.
    code: String                                                                // Möglicherweise Code für die einzelnen Produkte.
});

module.exports = mongoose.model('Approval', ApprovalSchema);
