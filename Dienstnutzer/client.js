var express = require('express');
var request = require('request');
var app = express();
var bodyParser = require('body-parser');

// file system module to perform file operations
const fs = require('fs');
var userData = fs.readFileSync("./userLogin.json");                             // Synchron weil man die Daten unbedingt braucht.
userData = JSON.parse(userData);

var cartID;                                                                     // Ganzes Warenkorb
var orderID;
var allProducts;
var employeeCheck;
var accessCheck = false;
var onlineUser;
var allPersons;
var freeEmployee = [];
//var serverURL = 'https://wba2demizkimuelders.herokuapp.com/app/';             //Server URL
var serverURL = 'http://localhost:8080/app/';                                   //___________Später entfernen !!!!!!!!!!!!!!!!!!!
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//----------------------- Login überprüfen (Alle) ------------------------------
app.post('/login', function(req, res){
  let urlEmployee = serverURL + 'employees';
  let username = req.body.username;
  let password = req.body.password;

  if (accessCheck == false){
    request.get(urlEmployee, function(err, response, body){                       // GET Request employee
      if(err){
        res.status(404).send('Fehler bei der GET request!');
      }
      else {
        allPersons = JSON.parse(body);

        for (var i = 0; i < allPersons.length; i++){
          if (allPersons[i].username == username && allPersons[i].password == password){
            onlineUser = allPersons[i];
            employeeCheck = allPersons[i].rank;
            accessCheck = true;

            // stringify JSON Object
            var userContent = JSON.stringify(onlineUser);

            fs.writeFile("userLogin.json", userContent, function (err) {        // Zum schnellen testen. Globale Variable (Fehler aufgetaucht).
                if (err) {
                  res.status(400).send('Fehler beim Login! (JSON)');
                }
            });
            res.status(201).send('Zugriff gewährt!');
          }
        }
        if (accessCheck == false)
        {
          res.status(401).send('Zugriff verweigert!');
        }
      }
    });
  }
  else {
    res.status(400).send('Sie sind schon angemeldet.');
  }
});
//---------------------------- Logout (Alle) -----------------------------------
app.get('/logout', function(req, res){
  accessCheck = false;
  fs.writeFile("userLogin.json", "", function (err) {                           // Zum schnellen testen. Globale Variable (Fehler aufgetauchen).
      if (err) {
        res.status(400).send('Fehler beim Logout! (JSON)');
      }
      else {
        res.status(200).send('Logout erfolgreich!');
      }
  });
});
//------------------- Produkt hinzufügen (Lagerverwalter) ----------------------
app.post('/products', function(req, res){
  if (accessCheck == true && employeeCheck == 'Lagerverwalter'){
    let urlProducts = serverURL + 'products';
    let productData = {
      "name" : req.body.name,
      "number" : req.body.number,
      "barcode" : req.body.barcode,
      "class" : req.body.class
    };
    let options = {
      uri: urlProducts,
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      json : productData
    };

    request.post(options, function(err, response, body){
      if(err){
        res.status(404).send('Fehler: POST Request');
      }
      else {
        res.status(201).send(body);
      }
    });
  }
  else {
    res.status(401).send("Keinen Zugriff auf die Aktivität: Produkt hinzufügen.");
  }
});
//---------------- Alle Produkte ausgeben (Lagerverwalter) ---------------------
app.get('/products', function(req, res){
  if (accessCheck == true && employeeCheck == 'Lagerverwalter'){
    let urlProducts = serverURL + 'products';

    request.get(urlProducts, function(err, response, body){
      if(err){
        res.status(404).send('Fehler: GET Request');
      }
      else {
        res.status(200).send(JSON.parse(body));
      }
    });
  }
  else {
    res.status(401).send('Keinen Zugriff auf die Aktivität: Produkt hinzufügen');
  }
});
//--------------------- Produkt löschen (Lagerverwalter) -----------------------
app.delete('/products/:product_id', function(req, res){
  if (accessCheck == true && employeeCheck == 'Lagerverwalter'){
    let urlProducts = serverURL + 'products/'+ req.params.product_id;

    var  options = {
      uri: urlProducts,
      method: 'DELETE',
      headers:{
        'Content-Type': 'application/json'
      },
    };

    request.delete(options, function(err, response, body){
      if(err){
        res.status(404).send('Fehler: GET Request');
      }
      else {
        res.status(200).send(JSON.parse(body));
      }
    });
  }
  else {
    res.status(401).send('Keinen Zugriff auf die Aktivität: Produkt hinzufügen');
  }
});
//-------------------- Auftrag erstellen (Manager) -----------------------------
app.get('/assignments', function(req, res){
  if (accessCheck == true && employeeCheck == 'Manager'){

    for (var i = 0; i < allPersons.length; i++){
      if (allPersons[i].orderID == ""){
        freeEmployee[i] = allPersons[i];
      }
    }
    res.status(200).send(freeEmployee);
  }
  else {
    res.status(401).send('Keinen Zugriff auf die Aktivität: Auftrag erstellen');
  }
});

app.post('/assignments', function(req, res){
  let selectedEmployee;
  let productClass;
  let urlOrder = serverURL + 'orders';
  if (accessCheck == true && employeeCheck == 'Manager'){

    for (var i = 0; i < freeEmployee.length; i++){
      if (freeEmployee[i]._id == req.body.employeeID){
        selectedEmployee = freeEmployee[i];
      }
    }

    if (selectedEmployee.approval == req.body.products.productClass){
      let orderData = {
        "orderName" : req.body.orderName,
        "description" : req.body.description,
        "username" : selectedEmployee.username,
        "products" : [{
            "productID": req.body.products.productID,
            "productName": req.body.products.productName,
            "method": req.body.products.method,
            "href": req.body.products.href
          }
        ]
      };
      let options = {
        uri: urlOrder,
        method: 'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        json : orderData
      };

      request.post(options, function(err, response, body){
        if(err){
          res.status(404).send('Fehler: POST request');
        }
        else {
          res.status(201).send(body);
        }
      });
    }
    else {
      res.status(401).send('Der Mitarbeiter ist nicht berechtigt dieses Produkt zu entnehmen.');
    }
  }
  else {
    res.status(401).send('Keinen Zugriff auf die Aktivität: Auftrag erstellen.');
  }
});
//-------------------- Auftrag bearbeiten (Alle) -------------------------------
app.get('/tasks', function(req, res){
  let urlOrder = serverURL + 'orders';
  let allOrders;
  let username = userData.username;

  if (accessCheck == true){                                                     // Login Überprüfung
    request.get(urlOrder, function(err, response, body){
      if(err){
        res.status(404).send('Fehler: GET request');
      }
      else {
        allOrders = JSON.parse(body);

        if (allOrders === null){
          res.status(404).send('Keine Aufträge gefunden!');
        }
        else {
          for (var i = 0; i < allOrders.length; i++){                           // -> Nur die User relevanten Order zeigen.
            if (allOrders[i].username == username){
              res.status(200).send(allOrders[i]);                               // Wir gehen erstmal davon aus, dass der Auftrag vergeben wurde.
            }
          }
        }
      }
    });
  }
  else {
    res.status(401).send('Fehlende Berechtigung. Bitte richtig einloggen!  -->POST http://localhost:3000/login');
  }
});

app.post('/tasks' , function(req, res){                                         // Auftrag ausgewählt. 1. Warenkorb erstellen ---> 2. Alle Produkte zeigen
  let urlCart = serverURL + 'carts';                                            // http://localhost:8080/task  POST (body)orderID = ...
  let urlProducts = serverURL + 'products';
  orderID = req.body.orderID;

  var cartData = {
    "username": userData.username,
    "orderID" : orderID,
    "links" : [{
        "productID": "",
        "rel": "" ,
        "method": "",
        "title": "",
        "href": ""
      }
    ]
  };
  var  options = {
    uri: urlCart,
    method: 'POST',
    headers:{
      'Content-Type': 'application/json'
    },
    json : cartData
  };

  request.post(options, function(err, response, body){                          // Request auf den Warenkorb. (POST) Erstellen eines Warenkorbes.
    if(err){
      res.status(404).send('Fehler: POST request');
    }
    else {
      cartID = body;
    }
  });

  request.get(urlProducts, function(err, response, body){                       // Request auf Produkte. (GET) Alle Produkte raussuchen.
    if(err){
      res.status(404).send('Fehler: GET request');
    }
    else {
      allProducts = JSON.parse(body);
      res.status(200).send(allProducts);
    }
  });
});

app.put('/tasks' , function(req, res){
  let userApproval = userData.approval;
  let urlProducts = serverURL + 'products/' + req.body.productID;
  let urlCart = serverURL + 'carts/' + cartID._id;
  let productAmount;
  let productName;
  let productID;
  let userClass = userData.approval;

  if (accessCheck == false){                                                     // Login Überprüfung! ___________Später auf 'false' setzen!!!
    res.status(401).send('Bitte erstmal einloggen!  -->POST http://localhost:3000/login');
  }
  else {
    if (typeof(cartID) == 'undefined'|| cartID === null){
      res.status(400).send('Bitte erstmal Warenkorb erstellen/auswählen!  -->POST http://localhost:3000/task');
    }
    else {
      for (var i = 0; i < allProducts.length; i++){
        if (allProducts[i]._id == req.body.productID){
          productID = allProducts[i]._id;
          productAmount = allProducts[i].number;
          productName = allProducts[i].name;
          productBarcode = allProducts[i].barcode;
          productClass = allProducts[i].class;
          break;
        }
      }
      if (productClass !== userClass){
        res.status(401).send('Entnahme nicht möglich! Notwendige Berechtigung fehlt.');
      }
      else {
        if (productAmount.number - req.body.number < 0){
          res.status(400).send('Entnahme nicht möglich! Die gewünschte Menge überschreitet den tatsächlichen Warebestand.');
        }
        else {
          let productData = {
            "name" : productName,
            "number" : productAmount - req.body.number,
            "barcode" : productBarcode,
            "class" : productClass
          };
          let  productOptions = {
            uri: urlProducts,
            method: 'PUT',
            headers:{
              'Content-Type': 'application/json'
            },
            json : productData
          };

          request.put(productOptions, function(err, response, body){            // Request auf Warenkorb. (PUT) Aktualliesieren des Warenkorbes mit den ausgewählten Produkten.
            if(err){
              res.status(404).send('Fehler: PUT Request');
            }
          });

          let cartData = {
            "username" : userData.username,
            "orderID" : orderID,
            "links" : [{
              "productID" : productID,
              "rel": 'Product',
              "method": 'GET',
              "title": productName,
              "href": urlProducts
            }]
          };

          let  cartOptions = {
            uri: urlCart,
            method: 'PUT',
            headers:{
              'Content-Type': 'application/json'
            },
            json : cartData
          };

          request.put(cartOptions, function(err, response, body){               // Request auf Warenkorb. (PUT) Aktualliesieren des Warenkorbes mit den ausgewählten Produkten.
            if(err){
              res.status(404).send('Fehler: PUT Request');
            }
            else {
              res.status(200).send(body);
            }
          });
        }
      }
    }
  }
});
//------------------------------------------------------------------------------


//==============================================================================
app.listen(3000, function(){
  console.log("Der Dienstnutzer ist nun auf Port 3000 verfügbar.");
});
