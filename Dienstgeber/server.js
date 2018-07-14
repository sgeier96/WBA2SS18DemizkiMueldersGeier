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
    res.status(200).send('Standard-Route worked!');
});

var Product = require('./app/models/product');                                  // Verweis auf den Konstruktor Product
var Employee = require('./app/models/employee');
var Order = require('./app/models/order');
var Cart = require('./app/models/cart');

// ========================== Produkt ROUTE ====================================
router.route('/products')

    .post(function(req, res) {                                                  // Ein Produkt erstellen (Zugriff: POST http://localhost:8080/app/products)

        var product = new Product();                                            // Eine neue Instanz von Produkt erstellt
        product.name = req.body.name;                                           // Den Namen wie aus der Request setzen
        product.number = req.body.number;
        product.barcode = req.body.barcode;
        product.class = req.body.class;

        Product.findOne({barcode: product.barcode},function(err, result) {      // Abfrage, ob so ein Produkt schon existiert
          if (err){
            res.status(200).send(err);
          }

          if (result) {
            res.status(200).send('Product already exsist!');
          } else {
            product.save(function(err) {                                        // Speichern des Produkts
                if (err){
                  res.status(500).send(err);
                }
                res.status(201).send('Product created!');
            });
          }
        });
    })
                                                                                // Alle Produkte (Zugriff: GET http://localhost:8080/app/products)
    .get(function(req, res) {
        Product.find(function(err, product) {
            if (err){
              res.status(500).send(err);
            }
            else {
              res.status(200).send(product);
            }
        });
    });
// -----------------------------------------------------------------------------
router.route('/products/:product_id')

    .get(function(req, res) {                                                   // Produkt mit der ID (Zugriff GET http://localhost:8080/app/products/:product_id)
        Product.findById(req.params.product_id, function(err, product) {
            if (err){
              res.status(500).send(err);
            }
            else {
              res.status(200).send(product);
            }
        });
    })

    .put(function(req, res) {                                                   // Aktualliesieren (Zugriff PUT http://localhost:8080/app/products/:product_id)

        Product.findById(req.params.product_id, function(err, product) {

            if (err){
              res.status(500).send(err);
            }
            else {
              product.name = req.body.name;
              product.number = req.body.number;
              product.barcode = req.body.barcode;
              product.class = req.body.class;                                   // Namen & Menge aktualliesieren

              if (product.number < 10){
                console.log("ATTENTION. NUMBER TOO LOW!!!");                    // Nachricht versenden, wenn zu wenig der Ware vorhanden ist.
              }
              product.save(function(err) {                                        // Produkt speichern
                  if (err){
                    res.status(500).send(err);
                  }
                  else {
                    res.status(200).send('Product updated!');
                  }
              });
            }
        });
    })

    .delete(function(req, res) {                                                // Das Produkt nach der ID gelöscht (Zugriff DELETE http://localhost:8080/app/products/:product_id)

        Product.deleteOne({
            _id: req.params.product_id
        }, function(err, product) {
            if (err){
              res.status(500).send(err);
            }
            else {
              res.status(200).send('Successfully deleted!');
            }
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
        employee.rank = req.body.rank;
        employee.approval = req.body.approval;
        employee.orderID = req.body.orderID;

        Employee.findOne({username: employee.username},function(err, result) {  // Abfrage, ob so ein Mitarbeiter schon existiert
          if (err){
            res.status(500).send(err);
          }

          if (result) {
            res.status(200).send('Employee already exsist!');
          } else {
            employee.save(function(err) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(201).send('Employee created!');
                }
            });
          }
        });
    })

    .get(function(req, res) {                                                   // Alle Mitarbeiter (Zugriff: GET http://localhost:8080/app/employees)
        Employee.find(function(err, employee) {
            if (err){
              res.status(500).send(err);
            }
            else {
              res.status(200).send(employee);
            }
        });
    });
// -----------------------------------------------------------------------------
router.route('/employees/:employee_id')

    .get(function(req, res) {                                                   // Mitarbeiter mit der ID (Zugriff GET http://localhost:8080/app/employees/:employee_id)
        Employee.findById(req.params.employee_id, function(err, employee) {
            if (err){
              res.status(500).send(err);
            }
            else {
              res.status(200).send(employee);
            }
        });
    })

    .put(function(req, res) {                                                   // Aktualliesieren (Zugriff PUT http://localhost:8080/app/employees/:employee_id)

        Employee.findById(req.params.employee_id, function(err, employee) {

            if (err){
              res.status(500).send(err);
            }
            else {
              employee.name = req.body.name;
              employee.surname = req.body.surname;
              employee.address = req.body.address;
              employee.age = req.body.age;
              employee.username = req.body.username;
              employee.password = req.body.password;
              employee.rank = req.body.rank;
              employee.approval = req.body.approval;
              employee.orderID = req.body.orderID;

              employee.save(function(err) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(200).send('Employee updated!');
                }
              });
            }
        });
    })

    .delete(function(req, res) {                                                // Den Mitarbeiter nach der ID gelöscht (Zugriff DELETE http://localhost:8080/app/employees/:employee_id)

        Employee.deleteOne({
            _id: req.params.employee_id
        }, function(err, employee) {
            if (err){
              res.status(500).send(err);
            }
            else {
              res.status(200).send('Successfully deleted');
            }
        });
    });

// ========================== Auftrags ROUTE ================================
router.route('/orders')

    .post(function(req, res) {                                                  // Einen Auftrag erstellen (Zugriff: POST http://localhost:8080/app/orders)

        var order = new Order();
        order.orderName = req.body.orderName;
        order.description = req.body.description;
        order.username = req.body.username;
        order.products = req.body.products;

        Order.findOne({orderName: order.orderName},function(err, result) {       // Abfrage, ob so ein Auftrag schon existiert
          if (err){
            res.status(500).send(err);
          }
          if (result) {
            res.status(200).send('Order already exsist!');
          } else {
            order.save(function(err) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(200).send(order);
                }
            });
          }
        });
    })

    .get(function(req, res) {                                                   // Alle Aufträge (Zugriff: GET http://localhost:8080/app/orders)
        Order.find(function(err, order) {
            if (err){
              res.status(500).send(err);
            }
            else {
              res.status(200).send(order);
            }
        });
    });
// -----------------------------------------------------------------------------
router.route('/orders/:order_id')

    .get(function(req, res) {                                                   // Auftrag mit der ID (Zugriff GET http://localhost:8080/app/orders/:order_id)
        Order.findById(req.params.order_id, function(err, order) {
            if (err){
              res.status(500).send(err);
            }
            else {
              res.status(200).send(order);
            }
        });
    })

    .put(function(req, res) {                                                   // Aktualliesieren (Zugriff PUT http://localhost:8080/app/orders/:order_id)

        Order.findById(req.params.order_id, function(err, order) {

            if (err){
              res.status(500).send(err);
            }
            else {
              order.orderName = req.body.orderName;
              order.description = req.body.description;
              order.username = req.body.username;
              order.products = req.body.products;

              order.save(function(err) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(200).send('Order updated!');
                }
              });
            }
        });
    })

    .delete(function(req, res) {                                                // Der Auftrag nach der ID gelöscht (Zugriff DELETE http://localhost:8080/app/approvals/:approval_id)

        Order.deleteOne({
            _id: req.params.order_id
        }, function(err, order) {
            if (err){
              res.status(500).send(err);
            }
            else {
              res.status(200).send('Successfully deleted');
            }
        });
    });

// ========================== Warenkorb ROUTE ================================
router.route('/carts')

    .get(function(req, res){
      res.status(501).send('Nicht bereitgestellt!');
    })
    .post(function(req, res) {

        var cart = new Cart();
        cart.username = req.body.username;
        cart.orderID = req.body.orderID;
        cart.links = req.body.links;

        Cart.findOne({username: cart.username},function(err, result) {          // Nach dem User Suchen.
          if (err){
             res.status(500).send(err);
          }

          if (result) {
            res.status(200).send(result);                                       // Cart wird zurückgeschickt
          } else {
            cart.save(function(err) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(201).send('Cart created!');
                }
            });
          }
        });
    });
// -----------------------------------------------------------------------------
router.route('/carts/:cart_id')

    .get(function(req, res) {
        Cart.findById(req.params.cart_id, function(err, cart) {                 // Nach cart_id suchen
            if (err){
              res.status(500).send(err);
            }
            else {
              res.status(200).send(cart);                                       // Warenkorb zurückschicken
            }
        });
    })

    .put(function(req, res) {
        Cart.findByIdAndUpdate(req.params.cart_id,
          {$push:{links: req.body.links}},                                      // Weitere Produkte hinzufügen
          {safe: true, upsert: true, new: true},
          function(err, cart) {
            if (err){
              res.status(500).send(err);
            }
            else {
              if(cart != null){
                cart.username = req.body.username;
                cart.orderID = req.body.orderID;

                cart.save(function(err) {
                  if (err){
                    res.status(500).send(err);
                  }
                  else {
                    res.status(200).send(cart);
                  }
                });
              }
              else {
                res.status(500).send(err);
              }
            }
        });
    });

//==============================================================================


app.use('/app', router);                                                        // Alle Routen werden mit /app eingeleitet.

//========================== MONGODB CONNECTION ================================
var mongoose   = require('mongoose');                                           //Mit mongoDB verbinden
mongoose.connect('mongodb+srv://vadeki:m81HjAmsYNoJS8g9@wba2-peu7d.mongodb.net/test?retryWrites=true', function(err, client) {
   if (err){
     res.status(500).send('Fehler bei der Verbindung zur Datenbank');
   }
});

// ========================= SERVER STARTEN ====================================
app.listen(port, function() {
    console.log("Server is running on port " + port);
});
