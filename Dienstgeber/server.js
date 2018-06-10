var express    = require('express');                                            // Aufruf express Modul
var app        = express();                                                     // Definiere app um express zu verwenden
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));                             // app so konfigurieren, dass bodyParser() verwendet wird,
app.use(bodyParser.json());                                                     // so können wir die Daten von einem POST erhalten

var port = process.env.PORT || 8080;                                            //den Port setzen


// ======================== ROUTEN FÜR UNSERE APP ==============================
var router = express.Router();                                                  // Instanz des Express Routers

router.use(function(req, res, next) {                                           // Middleware, dass für alle Anfragen benutzt wird
    console.log('A request has come in!');
    next();                                                                     // Das next() ist dafür da, damit nach dieser Route nicht schluss ist
});

router.get('/', function(req, res) {                                            // Test Route (Zugriff: GET http://localhost:8080/app)
    res.json({ message: 'Standard-Route worked!' });
});

var Product = require('./app/models/product');                                  // Verweis auf den Konstruktor Product
// -----------------------------------------------------------------------------
router.route('/products')

    .post(function(req, res) {                                                  // Ein Produkt erstellen (Zugriff: POST http://localhost:8080/app/product)

        var product = new Product();                                            // Eine neue Instanz von Produkt erstellt
        product.name = req.body.name;                                           // Den Namen wie aus der Request setzen

        product.save(function(err) {                                            // Speichern des Produkts
            if (err)
                res.send(err);

            res.json({ message: 'Product created!' });
        });
    })
                                                                                // Alle Produkte (Zugriff: GET http://localhost:8080/app/product)
    .get(function(req, res) {
        Product.find(function(err, product) {
            if (err)
                res.send(err);

            res.json(product);
        });
    });
// -----------------------------------------------------------------------------
router.route('/products/:product_id')

    .get(function(req, res) {                                                   // Produkt mit der ID (Zugriff GET http://localhost:8080/app/product/:product_id)
        Product.findById(req.params.product_id, function(err, product) {
            if (err)
                res.send(err);
            res.json(product);
        });
    })

    .put(function(req, res) {                                                   // Aktualliesieren (Zugriff PUT http://localhost:8080/app/product/:product_id)

        Product.findById(req.params.product_id, function(err, product) {

            if (err)
                res.send(err);
            product.name = req.body.name;                                       // Namen aktualliesieren
            product.save(function(err) {                                        // Produkt speichern
                if (err)
                    res.send(err);

                res.json({ message: 'Product updated!' });
            });
        });
    })

    .delete(function(req, res) {                                                // Das Produkt nach der ID gelöscht (Zugriff DELETE http://localhost:8080/app/product/:product_id)

        Product.deleteOne({
            _id: req.params.product_id
        }, function(err, product) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

app.use('/app', router);                                                        // Alle Routen werden mit /app eingeleitet.

//========================== MONGODB CONNECTION ================================
var mongoose   = require('mongoose');                                           //Mit mongoDB verbinden
mongoose.connect('mongodb+srv://vadeki:m81HjAmsYNoJS8g9@wba2-peu7d.mongodb.net/test?retryWrites=true', function(err, client) {
   if (err){
     console.log("Fehler bei der Verbindung zur Datenbank");
   }
});


// ========================= SERVER STARTEN ====================================
app.listen(port);
console.log('Der Server ist über dem Port ' + port + ' ansprechbar!');
