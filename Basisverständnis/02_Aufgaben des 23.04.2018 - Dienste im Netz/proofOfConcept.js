var fs = require('fs');                                                         //I/O-functions
var express = require("express");                                               //app.get, etc.
var request = require("request");                                               //request(url, function(err, res, body))), etc.
//var bodyParser = require("bodyParser");                                         //parser for i.e. JSON

var app = express();
var result;

const settings = {
  port: process.env.PORT || 6458
  //...
}

var okta = {
  staticURLPart: "https://dev-989237.oktapreview.com/api/v1/",
  apikey: "000mGb4MnfuqumngmGcxL1lx_-wx8LkcFY_1Jw6EZC"
  //...
}

//---------------------JUST A PLAYGROUND-----------------------

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
  console.log("error: ", error); //Print the error if one occured
  console.log("statusCode: ", res && res.statusCode); //Print the response status code if a response was received
  console.log(body);
});


//--------------------END OF PLAYGROUND------------------------

app.get('/*', function(req, res){
  response.send("GET-Answer. Thrilling, isn't it?");
});

app.post('/*', function(req, res){
  response.send(result);
});


app.listen(settings.port, function(){
  console.log("'Dienstgeber' now running on port " + settings.port);
})
