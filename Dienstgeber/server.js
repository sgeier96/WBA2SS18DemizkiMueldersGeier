var express    = require('express');                                            // Aufruf express Modul
var app        = express();                                                     // Definiere app um express zu verwenden
var bodyParser = require('body-parser');

var http = require('http');                                                     // Für faye(PUB-SUB)
var faye = require('faye');
//================================= FAYE =======================================
var fayeService = new faye.NodeAdapter({ mount: '/', timeout: 45});
var fayeServer = http.createServer(app);
fayeService.attach(fayeServer);
//==============================================================================

app.use(bodyParser.urlencoded({ extended: true }));                             // app so konfigurieren, dass bodyParser() verwendet wird,
app.use(bodyParser.json());                                                     // so können wir die Daten von einem POST erhalten

var port = process.env.PORT || 8080;

// ======================== ROUTEN FÜR UNSERE APP ==============================
var router = express.Router();                                                  // Instanz des Express Routers

app.use(function(req, res, next) {                                              // Middleware, dass für alle Anfragen benutzt wird
    console.log('A request has come in!');
    next();                                                                     // Das next() ist dafür da, damit nach dieser Route nicht schluss ist
});

app.get('/', function(req, res) {                                               // Test Route (Zugriff: GET http://localhost:8080/app)
    res.status(200).send('Standard-Route worked!');
});

var productsRoute = require('./routes/productsRoute');
var employeesRoute = require('./routes/employeesRoute');
var ordersRoute = require('./routes/ordersRoute');
var cartsRoute = require('./routes/cartsRoute');

app.use('/products', productsRoute);
app.use('/employees', employeesRoute);
app.use('/orders', ordersRoute);
app.use('/carts', cartsRoute);
//app.use('/app', router);                                                      // Alle Routen werden mit /app eingeleitet.

//========================== MONGODB CONNECTION ================================
var mongoose   = require('mongoose');                                           // Mit mongoDB verbinden
mongoose.connect('mongodb+srv://vadeki:m81HjAmsYNoJS8g9@wba2-peu7d.mongodb.net/test?retryWrites=true', function(err, client) {
   if (err){
     res.status(500).send('Fehler bei der Verbindung zur Datenbank');
   }
});
//============================= Faye SERVER ====================================   Keine andere Lösung gefunden um faye und express Router gleichzeitig
fayeServer.listen(8000);                                                        // zu verwenden. Ein extra Server nur für die faye Kommunikation.
// ========================= SERVER STARTEN ====================================
app.listen(port, function() {
    console.log("Server is running on port " + port);
});
