var express = require('express');
var request = require('request');
var app = express();
var bodyParser = require('body-parser');

// file system module to perform file operations
const fs = require('fs');
var userData = fs.readFileSync("./userLogin.json");

var serverURL = 'https://wba2demizkimuelders.herokuapp.com/app/';               //Server URL
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


global.onlineUser;
//=============================== Funktionen ===================================


//============================ Standard REQUESTS ===============================
/*
app.get('/products', function(req, res){
    let url = serverURL + 'products';

    request(url, function(err, response, body){                                  //Nur für GET so möglich
      body = JSON.parse(body);
      res.json(body);

    });
});
*/
//--------------------------- Login überprüfen ---------------------------------
app.post('/login', function(req, res){
  let urlEmployee = serverURL + 'employees';
  let allPersons;
  let username = req.body.username;
  let password = req.body.password;
  let accessCheck = false;

  request.get(urlEmployee, function(err, response, body){
    if(err)
      res.status(400).end();
    allPersons = JSON.parse(body);

    for (var i = 0; i < allPersons.length; i++){
      if (allPersons[i].username == username && allPersons[i].password == password){
        onlineUser = allPersons[i];
        accessCheck = true;

        // stringify JSON Object
        var userContent = JSON.stringify(onlineUser);
        //console.log(jsonContent);

        fs.writeFile("userLogin.json", userContent, function (err) {
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
  });
});
//--------------------------- Auftrag bearbeiten -------------------------------
app.get('/task', function(req, res){
  let urlOrder = serverURL + 'orders';
  let urlProducts = serverURL + 'products';
  let allOrders;

  userData = JSON.parse(userData);
  let username = userData.username;

  request.get(urlOrder, function(err, response, body){
    if(err)
      res.status(400).end();
    allOrders = JSON.parse(body);

    for (var i = 0; i < allOrders.length; i++){                                 // -> Nur die User relevanten Order zeigen.
      if (allOrders[i].username == username){                                   // Wir gehen erstmal davon aus, dass der Auftrag vergeben wurde.
        res.json(allOrders[i]);
        res.status(200).end();
      }
    }
  });
});

app.post('/task' , function(req, res){                                          //Auftrag ausgewählt. Warenkorb erstellen ---> Produkte hinzufügen ---> Bestätigen(Fertig)
  let urlCart = serverURL + 'carts';                                            //http://localhost:8080/task  POST orderID = ...
  let orderID = req.body.orderID;
  userData = JSON.parse(userData);
  approval = userData.approval;

  var cartData = {
    "username": userData.username,
    "orderID" : orderID
  };
  var  options = {
    uri: urlCart,
    method: 'POST',
    headers:{
      'Content-Type': 'application/json'
    },
    json : cartData
  };
  /*
  request.post(options, function(err, response, body){
    if(err)
      res.status(400).end();
    console.log("Erstellt!");
    res.json(body);
  });
  */
});

//------------------------------------------------------------------------------


//==============================================================================
app.listen(8080, function(){
  console.log("Der Dienstnutzer ist nun auf Port 8080 verfügbar.");
});
