var express = require('express');                                               // Einbindung von Modulen
var request = require('request');
var app = express();
var bodyParser = require('body-parser');

var faye = require('faye');                                                     // Notwendig für PUB-SUB
var fayeClient = new faye.Client('http://localhost:8000');                      //<-----Momentan nur lokal!!!

// file system module to perform file operations
const fs = require('fs');
var userData = fs.readFileSync("./userLogin.json");                             // Synchron Aufbau, weil man die Daten unbedingt braucht.
userData = JSON.parse(userData);
                                                                                //____Wichtige globale Variablen, die mehrmals benutzt werden. ____
var cartID;                                                                     // <-- Ganzes Warenkorb
var orderID;                                                                    // <-- Auftragsnummer
var allProducts;                                                                // <-- Alle Produkte
var employeeCheck;                                                              // <-- Testen, welcher Mitarbeiter online ist
var accessCheck = false;                                                        // <-- Testen, ob einer Online ist
var onlineUser;                                                                 // <-- aktuelle User Daten
var allPersons;                                                                 // <-- Alle Personen
var freeEmployee = [];                                                          // <-- Jeder Mitarbeiter der keine Arbeit hat
var serverURL = 'https://wba2demizkimuelders.herokuapp.com/';                   // <-- Server URL
//var serverURL = 'http://localhost:8080/app/';                                 // <-- Zum schnellen testen (lokal)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//----------------------- Login überprüfen (Alle) ------------------------------
app.post('/login', function(req, res){                                          // POST http://localhost:3000/login body = {username,password}
  let urlEmployee = serverURL + 'employees';
  let username = req.body.username;
  let password = req.body.password;

  if (accessCheck == false){                                                    // Check, ob online
    request.get(urlEmployee, function(err, response, body){                     // GET Request /employees
      if(err){
        res.status(404).send('Fehler bei der GET request!');
      }
      else {
        allPersons = JSON.parse(body);                                          // alle Personen abspeichern

        for (var i = 0; i < allPersons.length; i++){                            // Übereinstimmung des Usernamen und Passwort prüfen
          if (allPersons[i].username == username && allPersons[i].password == password){
            onlineUser = allPersons[i];
            employeeCheck = allPersons[i].rank;
            accessCheck = true;                                                 // User ist nun Online

            // stringify JSON Object
            var userContent = JSON.stringify(onlineUser);

            fs.writeFile("userLogin.json", userContent, function (err) {        // Zum schnellen testen. Bei einer globalen Variable sind Fehler aufgetaucht.
                if (err) {
                  res.status(400).send('Fehler beim Login! (JSON)');
                }
            });

            switch (employeeCheck) {
              case "Lagerverwalter":                                            // <------------ console.log() ersetzen durch was passendes!!!!
                fayeClient.subscribe('/products', function(message){console.log(message.text);});
                res.status(201).send('Zugriff gewährt! Folgende Funktionen stehen ihnen zur Verfügung: \n Logout (GET - http://localhost:3000/logout ),\n Alle Produkte ausgeben (GET - http://localhost:3000/products ),\n Produkt hinzufügen (POST - http://localhost:3000/products )\n oder Produkt löschen (DELETE - http://localhost:3000/products/:product_id )');
                break;
              case "Azubi":
                fayeClient.subscribe('/orders/'+ username, function(message){console.log(message.text);});
                res.status(201).send('Zugriff gewährt! Folgende Funktionen stehen ihnen zur Verfügung: \n Logout (GET - http://localhost:3000/logout ),\n Alle Aufträge anzeigen (GET - http://localhost:3000/tasks )');
                break;
              case "Manager":
                fayeClient.subscribe('/carts', function(message){console.log(message.text);});
                res.status(201).send('Zugriff gewährt! Folgende Funktionen stehen ihnen zur Verfügung: \n Logout (GET - http://localhost:3000/logout ),\n Alle Mitarbeiter ohne Aufgabe anzeigen (GET - http://localhost:3000/assignments )');
                break;
            }
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
app.get('/logout', function(req, res){                                          // GET http://localhost:3000/logout
  accessCheck = false;
  fs.writeFile("userLogin.json", "{}", function (err) {                         // Löschen der User Daten aus userLogin.json
      if (err) {
        res.status(400).send('Fehler beim Logout! (JSON)');
      }
      else {
        res.status(200).send('Logout erfolgreich!');
      }
  });
});
//------------------- Produkt hinzufügen (Lagerverwalter) ----------------------
app.post('/products', function(req, res){                                       // POST http://localhost:3000/products body = {name,number("bedeutet Anzahl"),barcode,class}
  if (accessCheck == true && employeeCheck == 'Lagerverwalter'){                // Testen, ob User angemeldet und ein Lagerverwalter ist
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

    request.post(options, function(err, response, body){                        // POST /products -> hinzufügen eines neuen Produktes
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
app.get('/products', function(req, res){                                        // GET http://localhost:3000/products
  if (accessCheck == true && employeeCheck == 'Lagerverwalter'){
    let urlProducts = serverURL + 'products';

    request.get(urlProducts, function(err, response, body){                     // GET /products -> Alle Produkte zeigen
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
app.delete('/products/:product_id', function(req, res){                         // DELETE http://localhost:3000/products/:product_id
  if (accessCheck == true && employeeCheck == 'Lagerverwalter'){
    let urlProducts = serverURL + 'products/'+ req.params.product_id;

    var  options = {
      uri: urlProducts,
      method: 'DELETE',
      headers:{
        'Content-Type': 'application/json'
      },
    };

    request.delete(options, function(err, response, body){                      // DELETE /products/:product_id
      if(err){
        res.status(404).send('Fehler: GET Request');
      }
      else {
        res.status(200).send(body);
      }
    });
  }
  else {
    res.status(401).send('Keinen Zugriff auf die Aktivität: Produkt hinzufügen');
  }
});
//-------------------- Auftrag erstellen (Manager) -----------------------------
app.get('/assignments', function(req, res){                                     // GET http://localhost:3000/assignments
  if (accessCheck == true && employeeCheck == 'Manager'){

    for (var i = 0; i < allPersons.length; i++){
      if (allPersons[i].orderID == ""){
        freeEmployee[i] = allPersons[i];
      }
    }
    freeEmployee.push('Auftrag erstellen (POST - http://localhost:3000/assignments )');// URL hinzugefügt, für das Hypermedia Konzpt
    res.status(200).send(freeEmployee);                                         // Alle Mitarbeiter ohne Aufgabe zeigen
  }
  else {
    res.status(401).send('Keinen Zugriff auf die Aktivität: Auftrag erstellen');
  }
});

app.post('/assignments', function(req, res){                                    // POST http://localhost:3000/assignments
  let selectedEmployee;                                                         // body = {employeeID,orderName,description,username,products[productName],...}
  let productClass;
  let urlOrder = serverURL + 'orders';
  if (accessCheck == true && employeeCheck == 'Manager'){                       // Checken, ob User = Manager

    for (var i = 0; i < freeEmployee.length; i++){                              // nach employeeID den Mitarbeiter auswählen
      if (freeEmployee[i]._id == req.body.employeeID){
        selectedEmployee = freeEmployee[i];
      }
    }

    if (selectedEmployee.approval == req.body.products.productClass){           // Prüfen, ob Ausgewählter die Produkte überhaupt entnehmen darf
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

      request.post(options, function(err, response, body){                      // POST /orders
        if(err){
          res.status(404).send('Fehler: POST request');
        }
        else {
          fayeClient.publish('/orders/' + selectedEmployee.username, {text: 'Neuer Auftrag ist eingegangen! ' + body}) // Für den Azubi
          .then(function(){
            console.log('Faye-Message received by server!');
          }, function(error) {
            console.log('There was an error publishing: '+ error.message);
          });
          res.status(201).send(body);                                           // Erstellte Order wird zurückgeschickt
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
//---------------- Auftrag bearbeiten (momentan nur Azubi) ---------------------
app.get('/tasks', function(req, res){                                           // GET http://localhost:3000/tasks
  let urlOrder = serverURL + 'orders';
  let allOrders;
  let username = userData.username;
  let userOrders = [];

  if (accessCheck == true){                                                     // Login Überprüfung
    request.get(urlOrder, function(err, response, body){
      if(err){
        res.status(404).send('Fehler: GET request');
      }
      else {
        allOrders = JSON.parse(body);

        if (allOrders === null){                                                // Wenn keine Aufträge verfügbar sind
          res.status(404).send('Keine Aufträge gefunden!');
        }
        else {
          for (var i = 0; i < allOrders.length; i++){                           // -> Nur die User relevanten Order zeigen.
            if (allOrders[i].username == username){
              userOrders.push(allOrders[i]);
            }
          }
          userOrders.push('Auftrag auswählen und alle Produkte anzeigen lassen. (POST - http://localhost:3000/tasks )');// URL hinzugefügt, für das Hypermedia Konzpt
          res.status(200).send(userOrders);
        }
      }
    });
  }
  else {
    res.status(401).send('Fehlende Berechtigung. Bitte richtig einloggen!  -->POST http://localhost:3000/login');
  }
});

app.post('/tasks' , function(req, res){                                         // POST http://localhost:3000/tasks   body = {orderID = ...}
  let urlCart = serverURL + 'carts';                                            // Auftrag ausgewählt. 1. Warenkorb erstellen ---> 2. Alle Produkte zeigen
  let urlProducts = serverURL + 'products';
  let urlEmployee = serverURL + 'employees/' + onlineUser._id;
  orderID = req.body.orderID;

  let updatedUser = {
    "name" : userData.name,
    "surname" : userData.surname,
    "address" : userData.address,
    "age" : userData.age,
    "username" : userData.username,
    "password" : userData.password,
    "rank"  : userData.rank,
    "approval" : userData.approval,
    "orderID" : orderID
  };

  let userOptions = {
    uri: urlEmployee,
    method: 'PUT',
    headers:{
      'Content-Type': 'application/json'
    },
    json : updatedUser
  };

  request.put(userOptions, function(err, response, body){                       // Request auf den Mitarbeiter. (PUT) Aktuellen Auftrag eintragen.
    if(err){
      res.status(404).send('Fehler: PUT request');
    }
  });

  let cartData = {
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
  let cartOptions = {
    uri: urlCart,
    method: 'POST',
    headers:{
      'Content-Type': 'application/json'
    },
    json : cartData
  };

  request.post(cartOptions, function(err, response, body){                      // Request auf den Warenkorb. (POST) Erstellen eines Warenkorbes.
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
      allProducts.push('Ausgewähltes Produkt dem Warenkorb hinzufügen. (PUT - http://localhost:3000/tasks )');
      res.status(200).send(allProducts);                                        // Senden aller Produkte, damit der Benutzer welche auswählen kann.
    }
  });
});

app.put('/tasks' , function(req, res){                                          // PUT http://localhost:3000/tasks   body = {productID = ..., number = ...}
  let userApproval = userData.approval;
  let urlProducts = serverURL + 'products/' + req.body.productID;
  let urlCart = serverURL + 'carts/' + cartID._id;
  let productAmount;
  let productName;
  let productID;
  let userClass = userData.approval;

  if (accessCheck == false){                                                    // Login Überprüfung!
    res.status(401).send('Bitte erstmal einloggen!  -->POST http://localhost:3000/login');
  }
  else {
    if (typeof(cartID) == 'undefined'|| cartID === null){                       // Check, ob Warenkorb erstellt wurde
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
      if (productClass !== userClass){                                          // Check, ob Mitarbeiter das Produkt entnehmen darf
        res.status(401).send('Entnahme nicht möglich! Notwendige Berechtigung fehlt.');
      }
      else {
        if (productAmount.number - req.body.number < 0){                        // Check, ob es genug Produkte im Lager gibt
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
            else {
              if (body === "ATTENTION. NUMBER TOO LOW!!!"){                     // Check (nach der erfolgreichen Entnahme), ob zu wenig auf Lager.
                fayeClient.publish('/products', {text: 'Die Menge des Produktes mit der ID: ' + productID + ' ist zu gering! Bitte nachbestellen.'})
                .then(function(){
                  console.log('Faye-Message received by server!');
                }, function(error) {
                  console.log('There was an error publishing: '+ error.message);
                });
              }
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
              fayeClient.publish('/carts', {text: 'Der Warenkorb und mit der ID: ' + cartID._id + ' wurde erstellt. Auftrag erfolgreich begonnen!'})
              .then(function(){
                console.log('Faye-Message received by server!');
              }, function(error) {
                console.log('There was an error publishing: '+ error.message);
              });
              res.status(200).send(body);                                       // Bestätigung der erfolgreichen Entnahme durch das Zusenden des Warenkorbes.
            }
          });
        }
      }
    }
  }
});
//------------------------------------------------------------------------------

//==============================================================================
app.listen(3000, function(){                                                    // Der Dienstgeber ist auf Port 3000 verfügbar.
  console.log("Der Dienstnutzer ist nun auf Port 3000 verfügbar.");
});
