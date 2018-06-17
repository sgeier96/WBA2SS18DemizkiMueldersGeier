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
var Approval = require('./app/models/approval');
var Order = require('./app/models/order');

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

// ========================== Genehmigung ROUTE ================================
router.route('/approvals')

    .post(function(req, res) {                                                  // Einen Genehmigung erstellen (Zugriff: POST http://localhost:8080/app/approvals)

        var approval = new Approval();
        approval.name = req.body.name;
        approval.username = req.body.username;
        approval.code = req.body.code;

        Approval.findOne({username: approval.username},function(err, result) {  // Abfrage, ob so eine Genehmigung schon existiert
          if (err)
              res.send(err);

          if (result) {
            res.json({ message: 'Approval already exsist!' });
          } else {
            approval.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Approval created!' });
            });
          }
        });
    })

    .get(function(req, res) {                                                   // Alle Genehmigungen (Zugriff: GET http://localhost:8080/app/approvals)
        Approval.find(function(err, approval) {
            if (err)
                res.send(err);

            res.json(approval);
        });
    });
// -----------------------------------------------------------------------------
router.route('/approvals/:approval_id')

    .get(function(req, res) {                                                   // Genehmigung mit der ID (Zugriff GET http://localhost:8080/app/approvals/:approval_id)
        Approval.findById(req.params.approval_id, function(err, approval) {
            if (err)
                res.send(err);
            res.json(approval);
        });
    })

    .put(function(req, res) {                                                   // Aktualliesieren (Zugriff PUT http://localhost:8080/app/employees/:employee_id)

        Approval.findById(req.params.approval_id, function(err, approval) {

            if (err)
                res.send(err);
            approval.name = req.body.name;
            approval.username = req.body.username;
            approval.code = req.body.code;

            approval.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'Approval updated!' });
            });
        });
    })

    .delete(function(req, res) {                                                // Die Genehmigung nach der ID gelöscht (Zugriff DELETE http://localhost:8080/app/approvals/:approval_id)

        Approval.deleteOne({
            _id: req.params.approval_id
        }, function(err, approval) {
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
    console.log("App is running on port " + port);
});
