var express = require('express');
var request = require('request');
var app = express();
var bodyParser = require('body-parser');

// file system module to perform file operations
const fs = require('fs');
var userData = fs.readFileSync("./userLogin.json");
userData = JSON.parse(userData);

var cartID;                                                                     // Ganzes Warenkorb
var orderID;
var allProducts;
var employeeCheck;
var accessCheck = false;
var onlineUser;
//var serverURL = 'https://wba2demizkimuelders.herokuapp.com/app/';             //Server URL
var serverURL = 'http://localhost:8080/app/';                                   //___________Später entfernen !!!!!!!!!!!!!!!!!!!
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//--------------------------- Login überprüfen ---------------------------------
app.post('/login', function(req, res){
  let urlEmployee = serverURL + 'employees';
  let allPersons;
  let username = req.body.username;
  let password = req.body.password;

  if (accessCheck == false){
    request.get(urlEmployee, function(err, response, body){                       // GET Request employee
      if(err){
        res.status(400).end();
      }
      else {
        allPersons = JSON.parse(body);

        for (var i = 0; i < allPersons.length; i++){
          if (allPersons[i].username == username && allPersons[i].password == password){
            onlineUser = allPersons[i];
            employeeCheck = userData.rank;
            accessCheck = true;

            // stringify JSON Object
            var userContent = JSON.stringify(onlineUser);

            fs.writeFile("userLogin.json", userContent, function (err) {          // Zum schnellen testen. Globale Variable (Fehler aufgetauchen).
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                }
                console.log("JSON file has been saved.");
            });

            res.json({message:"Zugriff gewährt!"});
            res.status(200).end();
          }
        }
        if (accessCheck == false)
        {
          res.json({message:"Zugriff verweigert!"});
          res.status(200).end();
        }
      }
    });
  }
  else {
    res.json({message:"Sie sind schon angemeldet."})
  }
});
//--------------------------- Auftrag erstellen --------------------------------






//--------------------------- Auftrag bearbeiten -------------------------------
app.get('/task', function(req, res){
  let urlOrder = serverURL + 'orders';
  let allOrders;
  let username = userData.username;

  if (accessCheck == true){                        // Login Überprüfung! ___________Später auf 'false' setzen!!!
    request.get(urlOrder, function(err, response, body){
      if(err){
        res.status(400).end();
      }
      else {
        allOrders = JSON.parse(body);

        if (allOrders === null){
          res.json({message: "Keine Aufträge gefunden!"})
        }
        else {
          for (var i = 0; i < allOrders.length; i++){                           // -> Nur die User relevanten Order zeigen.
            if (allOrders[i].username == username){                             // Wir gehen erstmal davon aus, dass der Auftrag vergeben wurde.
              res.json(allOrders[i]);
              res.status(200).end();
            }
          }
        }
      }
    });
  }
  else {
    res.json({message: "Fehlende Berechtigung. Bitte richtig einloggen!  -->POST http://localhost:3000/login"})
  }
});

app.post('/task' , function(req, res){                                          // Auftrag ausgewählt. 1. Warenkorb erstellen ---> 2. Alle Produkte zeigen
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
      res.status(400).end();
    }
    else {
      cartID = body;
      //console.log("Warenkorb erstellt!");
      //console.log(cartID._id);
      //res.json(body);
    }
  });

  request.get(urlProducts, function(err, response, body){                       // Request auf Produkte. (GET) Alle Produkte raussuchen.
    if(err){
      res.status(400).end();
    }
    else {
      allProducts = JSON.parse(body);
      //res.json({message: "Alle Produkte!"})
      res.json(allProducts);
    }
  });
});

app.put('/task' , function(req, res){
  let userApproval = userData.approval;
  let urlProducts = serverURL + 'products/' + req.body.productID;
  let urlCart = serverURL + 'carts/' + cartID._id;
  let productAmount;
  let productName;
  let productID;
  let userClass = userData.approval;

  if (accessCheck == false){                                                     // Login Überprüfung! ___________Später auf 'false' setzen!!!
    res.json({message: "Bitte erstmal einloggen!  -->POST http://localhost:3000/login"})
  }
  else {
    if (typeof(cartID) == 'undefined'|| cartID === null){
      res.json({message: "Bitte erstmal Warenkorb erstellen/auswählen!  -->POST http://localhost:3000/task"})
    }
    else {
      for (var i = 0; i < allProducts.length; i++){
        if (allProducts[i]._id == req.body.productID){
          productID = allProducts[i]._id;
          productAmount = allProducts[i].number;
          productName = allProducts[i].name;
          productClass = allProducts[i].class;
          break;
        }
      }
      if (productClass !== userClass){
        res.json({message: "Entnahme nicht möglich! Notwendige Berechtigung fehlt."});
      }
      else {
        if (productAmount.number - req.body.number < 0){
          res.json({message: "Entnahme nicht möglich! Die gewünschte Menge überschreitet den tatsächlichen Warebestand."});
        }
        else {
          let productData = {
            "name" : productName,
            "number" : productAmount - req.body.number
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
              res.status(400).end();
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
              res.status(400).end();
            }
            else {
              res.json(body);
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
