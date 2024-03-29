var fs                    = require('fs');                                               //I/O-functions
var express               = require("express");                                          //app.get, etc.
var request               = require("request");                                          //request(url, function(err, res, body))), etc.
//var bodyParser = require("bodyParser");                                       //parser for i.e. JSON
var stdin                 = process.openStdin();
var stdio                 = require('stdio');
var readlineSync          = require('readline-sync');


var app                   = express();
var result;

const settings            = {
  port: process.env.PORT || 6458
  //...
}

var okta                  = {
  staticURLPart: "https://dev-989237.oktapreview.com/api/v1/",
  api_token: '00fcqg4Dh2qmAr-SVcLT9Zxwq48i3xuyWhWNJrMZzX'
  //...
}

//---------------------JUST A PLAYGROUND-----------------------

stdin.addListener("data", function(d){
  //note: d is an object, and when converted to a string it will
  //end with a linefeed. So we (rather crudely) account for that
  //with toString() and them trim()
  let latestInput         = d.toString().trim();
  processConsoleInput(latestInput);
});

/*
var user =
'{"username": "DaveDaveson@webmail.com",'+
'"password": "62iLfVqn"}';



var options = {
  url: okta.staticURLPart + "/authn",
  body: user,
  headers: {
    'Accept' : 'application/json',
    'Content-Type' : 'application/json'
  }
}

request.post(options, function(error, res, body){
  console.log("error: ", error);                                                //Print the error if one occured
  console.log("statusCode: ", res && res.statusCode);                           //Print the response status code if a response was received
  console.log("\n");
  console.log(JSON.parse(body));
});
*/

//--------------------END OF PLAYGROUND------------------------

app.get('/*', function(req, res){
  response.send("GET-Answer. Thrilling, isn't it?");
});

app.post('/*', function(req, res){
  response.send(result);
});

function processConsoleInput (latestInput){
  switch (latestInput) {
    case "login":
          login();
          break;
    case "register":
          register();
          break;
    case "create group":
          createGroup();
          break;
    case "update group":
          searchGroupByName().then(function(result){
            updateGroup(result);
          });
          break;
    case "get current user":
          getCurrentUser();
          break;
    case "remove group":
          searchGroupByName().then(function(result){
            removeGroup(result);
          });
      break;
  }
}

function getCurrentUser(){
  var options             = {
    url: okta.staticURLPart + "/users/me",
    headers: {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json',
      'Authorization' : 'SSWS ' + okta.api_token
    }
  }
  request.get(options, function(error, res, body){
    if (error            != null) {
      console.log("error: " + error);
      console.log("statusCode: ", res && res.statusCode);
    } else {
      console.log("statusCode: ", res && res.statusCode);
      console.log("\n");
      console.log(JSON.parse(body));
    }
  });
}

function login(){
  let username            = readlineSync.question('Username/Email address: ');
  let password            = readlineSync.question('Password: ', {
    hideEchoBack: true
  });

  var options             = {
    url: okta.staticURLPart + "/authn",
    body: '{"username": "' + username + '",'+
    '"password": "' + password + '"}',
    headers: {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json'
    }
  }

  request.post(options, function(error, res, body){
    console.log("error: ", error);                                                       //Print the error if one occured
    console.log("statusCode: ", res && res.statusCode);                                  //Print the response status code if a response was received
    console.log("\n");
    console.log(JSON.parse(body));
  });
}

function createGroup(){

  let groupName           = readlineSync.question('Preferred group name: ');
  let groupDescription    = readlineSync.question('Preferred group description: ');

  var options             = {
    url: okta.staticURLPart + "/groups",
    body: '{ "profile": { "name": "' + groupName +
    '", "description": "' + groupDescription + '"}}',
    headers: {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json',
      'Authorization' : 'SSWS ' + okta.api_token
    }
  }

  request.post(options, function(error, res, body){
    console.log("error: ", error);
    console.log("statusCode: ", res && res.statusCode);
    console.log("\n");
    console.log(JSON.parse(body));
  });
}

function searchGroupByName(){
  let searchedString = readlineSync.question('By which string should be searched?: ');
  var options        = {
    url: okta.staticURLPart + "/groups?=" + searchedString + '&filter=type%20eq%20%22OKTA_GROUP%22&limit=10',
    headers: {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json',
      'Authorization' : 'SSWS ' + okta.api_token
    }
  }
  return new Promise(function(resolve, reject){
    request.get(options, function(error, res, body){
      if (error            != null) {
        console.log("error: " + error);
        console.log("statusCode: ", res && res.statusCode);
      } else {
        console.log("statusCode: ", res && res.statusCode);
        console.log("\n");
        console.log(JSON.parse(body));
        console.log("--------------------");
        console.log("passed id: " + JSON.parse(body)[0].id);

        resolve(JSON.parse(body)[0].id);
      }
    });
  });
}

function updateGroup(groupId){

  console.log("groupId updateGroup() got: " + groupId);

  let newGroupName        = readlineSync.question('New group name: ');
  let newGroupDescription = readlineSync.question('New group description: ');

  var options             = {
    url: okta.staticURLPart + "/groups/" + groupId,
    body: '{ "profile": { "name": "' + newGroupName +
    '", "description": "' + newGroupDescription + '"}}',
    headers: {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json',
      'Authorization' : 'SSWS ' + okta.api_token
    }
  }
  request.put(options, function(error, res, body){
    if (error            != null) {
      console.log("error: " + error);
      console.log("statusCode: ", res && res.statusCode);
    } else {
      console.log("statusCode: ", res && res.statusCode);
      console.log("\n");
      console.log(JSON.parse(body));
    }
  });
}

function removeGroup(groupId){
  var options             = {
    url: okta.staticURLPart + "/groups/" + groupId,
    headers: {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json',
      'Authorization' : 'SSWS ' + okta.api_token
    }
  }

  request.delete(options, function(error, res, body){
    if (error != null) {
      console.log("error: " + error);
      console.log("statusCode: ", res && res.statusCode);
    } else {
      console.log("statusCode: ", res && res.statusCode); //"HTTP/1.1 204 No Content" expected
    }
  });
}

function register(){
  let firstName           = readlineSync.question('first name: ');
  let lastName            = readlineSync.question('last name: ');
  let prefEmail           = readlineSync.question('email: ');
  let prefPassword        = readlineSync.question('password: ');

  var options             = {
    url: okta.staticURLPart + "/users",                                                  //?activate=false preferably, but in our case not necessary
    body: '{ "profile": { "firstName": "' + firstName +
    '", "lastName": "' + lastName +
    '", "email": "' + prefEmail +
    '", "login": "' + prefEmail +
    '"}, "credentials": { "password": {"value": "' + prefPassword +
    '"}}}',
    headers: {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json',
      'Authorization' : 'SSWS ' + okta.api_token
    }
  }

  request.post(options, function(error, res, body){
    console.log("error: ", error);
    console.log("statusCode: ", res && res.statusCode);
    console.log("\n");
    console.log(JSON.parse(body));
  });
}

app.listen(settings.port, function(){
  console.log("'Dienstgeber' now running on port " + settings.port);
})
