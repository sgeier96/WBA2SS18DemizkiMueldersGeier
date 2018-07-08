var express    = require('express');                                            // Aufruf express Modul
var app        = express();                                                     // Definiere app um express zu verwenden
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));                             // app so konfigurieren, dass bodyParser() verwendet wird,
app.use(bodyParser.json());                                                     // so können wir die Daten von einem POST erhalten

var port = process.env.PORT || 8080;                                            // den Port setzen

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
var Employee = require('./app/models/employee');
var Order = require('./app/models/order');
var Cart = require('./app/models/cart')
// ========================== Produkt ROUTE ====================================
router.route('/products')

    .post(function(req, res) {                                                  // Ein Produkt erstellen (Zugriff: POST http://localhost:8080/app/products)

        var product = new Product();                                            // Eine neue Instanz von Produkt erstellt
        product.name = req.body.name;                                           // Den Namen wie aus der Request setzen
        product.number = req.body.number;
        product.barcode = req.body.barcode;

        Product.findOne({barcode: product.barcode},function(err, result) {      // Abfrage, ob so ein Produkt schon existiert
          if (err)
              res.send(err);

          if (result) {
            res.json({ message: 'Product already exsist!' });
          } else {
            product.save(function(err) {                                        // Speichern des Produkts
                if (err)
                    res.send(err);

                res.json({ message: 'Product created!' });
                //res.status(200).json({uri: req.protocol + ":// + req.headers.host + "/" +..."})  URI mit übergeben!!!!!!!!!
            });
          }
        });
    })
                                                                                // Alle Produkte (Zugriff: GET http://localhost:8080/app/products)
    .get(function(req, res) {
        Product.find(function(err, product) {
            if (err)
                res.send(err);

            res.json(product);
        });
    });
// -----------------------------------------------------------------------------
router.route('/products/:product_id')

    .get(function(req, res) {                                                   // Produkt mit der ID (Zugriff GET http://localhost:8080/app/products/:product_id)
        Product.findById(req.params.product_id, function(err, product) {
            if (err)
                res.send(err);
            res.json(product);
        });
    })

    .put(function(req, res) {                                                   // Aktualliesieren (Zugriff PUT http://localhost:8080/app/products/:product_id)

        Product.findById(req.params.product_id, function(err, product) {

            if (err)
                res.send(err);
            product.name = req.body.name;
            product.number = req.body.number;                                   // Namen & Menge aktualliesieren

            if (product.number < 10){
              console.log("ATTENTION. NUMBER TOO LOW!!!");                      // Nachricht versenden, wenn zu wenig der Ware vorhanden ist.
            }
            product.save(function(err) {                                        // Produkt speichern
                if (err)
                    res.send(err);

                res.json({ message: 'Product updated!' });
            });
        });
    })

    .delete(function(req, res) {                                                // Das Produkt nach der ID gelöscht (Zugriff DELETE http://localhost:8080/app/products/:product_id)

        Product.deleteOne({
            _id: req.params.product_id
        }, function(err, product) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

// ========================== Mitarbeiter ROUTE ================================
router.route('/employees')

    .post(function(req, res) {                                                  // Einen Mitarbeiter erstellen (Zugriff: POST http://localhost:8080/app/employees)

        var employee = new Employee();
        employee.name = req.body.name;
        employee.surname = req.body.surname;
        employee.address = req.body.address;
        employee.age = req.body.age;
        employee.username = req.body.username;
        employee.password = req.body.password;

        Employee.findOne({username: employee.username},function(err, result) {  // Abfrage, ob so ein Mitarbeiter schon existiert
          if (err)
              res.send(err);

          if (result) {
            res.json({ message: 'Employee already exsist!' });
          } else {
            employee.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Employee created!' });
            });
          }
        });
    })

    .get(function(req, res) {                                                   // Alle Mitarbeiter (Zugriff: GET http://localhost:8080/app/employees)
        Employee.find(function(err, employee) {
            if (err)
                res.send(err);

            res.json(employee);
        });
    });
// -----------------------------------------------------------------------------
router.route('/employees/:employee_id')

    .get(function(req, res) {                                                   // Mitarbeiter mit der ID (Zugriff GET http://localhost:8080/app/employees/:employee_id)
        Employee.findById(req.params.employee_id, function(err, employee) {
            if (err)
                res.send(err);
            res.json(employee);
        });
    })

    .put(function(req, res) {                                                   // Aktualliesieren (Zugriff PUT http://localhost:8080/app/employees/:employee_id)

        Employee.findById(req.params.employee_id, function(err, employee) {

            if (err)
                res.send(err);
            employee.name = req.body.name;
            employee.surname = req.body.surname;
            employee.address = req.body.address;
            employee.age = req.body.age;
            employee.username = req.username;
            employee.password = req.password;
            employee.approval = req.approval;

            employee.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'Employee updated!' });
            });
        });
    })

    .delete(function(req, res) {                                                // Den Mitarbeiter nach der ID gelöscht (Zugriff DELETE http://localhost:8080/app/employees/:employee_id)

        Employee.deleteOne({
            _id: req.params.employee_id
        }, function(err, employee) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

// ========================== Auftrags ROUTE ================================
router.route('/orders')

    .post(function(req, res) {                                                  // Einen Auftrag erstellen (Zugriff: POST http://localhost:8080/app/orders)

        var order = new Order();
        order.name = req.body.name;
        order.orderNumber = req.body.orderNumber;

        Order.findOne({orderNumber: order.number},function(err, result) {       // Abfrage, ob so ein Auftrag schon existiert
          if (err)
              res.send(err);

          if (result) {
            res.json({ message: 'Order already exsist!' });
          } else {
            order.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Order created!' });
            });
          }
        });
    })

    .get(function(req, res) {                                                   // Alle Aufträge (Zugriff: GET http://localhost:8080/app/orders)
        Order.find(function(err, order) {
            if (err)
                res.send(err);

            res.json(order);
        });
    });
// -----------------------------------------------------------------------------
router.route('/orders/:order_id')

    .get(function(req, res) {                                                   // Auftrag mit der ID (Zugriff GET http://localhost:8080/app/orders/:order_id)
        Order.findById(req.params.order_id, function(err, order) {
            if (err)
                res.send(err);
            res.json(order);
        });
    })

    .put(function(req, res) {                                                   // Aktualliesieren (Zugriff PUT http://localhost:8080/app/orders/:order_id)

        Order.findById(req.params.order_id, function(err, order) {

            if (err)
                res.send(err);
            order.name = req.body.name;
            order.orderNumber = req.body.orderNumber;

            order.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'Order updated!' });
            });
        });
    })

    .delete(function(req, res) {                                                // Der Auftrag nach der ID gelöscht (Zugriff DELETE http://localhost:8080/app/approvals/:approval_id)

        Order.deleteOne({
            _id: req.params.order_id
        }, function(err, order) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

// ========================== Warenkorb ROUTE ================================
router.route('/carts')

    .post(function(req, res) {

        var cart = new Cart();
        cart.username = req.body.username;
        cart.orderID = req.body.orderID;
        cart.links = req.body.links;

        Cart.findOne({username: cart.username},function(err, result) {          //Nach dem User Suchen.
          if (err)
              res.send(err);

          if (result) {
            //res.json({ message: 'Cart already exsist!' });
            res.json(cart);                                                      //To-Do: Die aktuellen links mit schicken!
          } else {
            cart.save(function(err) {
                if (err)
                    res.send(err);

                //res.json({ message: 'Cart created!' });
                //res.status(203).end();
                res.json(cart);                                                 //Cart_ID zurückschicken
            });
          }
        });
    });
// -----------------------------------------------------------------------------
router.route('/carts/:cart_id')

    .get(function(req, res) {
        Cart.findById(req.params.cart_id, function(err, cart) {
            if (err)
                res.send(err);
            res.json(cart);
        });
    })

    .put(function(req, res) {

        Cart.findById(req.params.cart_id, function(err, cart) {

            if (err)
                res.send(err);
            cart.links = req.body.links;

            cart.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'Cart updated!' });
            });
        });
    })

//==============================================================================


app.use('/app', router);                                                        // Alle Routen werden mit /app eingeleitet.

//========================== MONGODB CONNECTION ================================
var mongoose   = require('mongoose');                                           //Mit mongoDB verbinden
mongoose.connect('mongodb+srv://vadeki:m81HjAmsYNoJS8g9@wba2-peu7d.mongodb.net/test?retryWrites=true', function(err, client) {
   if (err){
     console.log("Fehler bei der Verbindung zur Datenbank");
   }
});

// ========================= SERVER STARTEN ====================================
app.listen(port, function() {
    console.log("Server is running on port " + port);
});
