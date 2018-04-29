var fs = require('fs');

var p = new Promise(function(resolve, reject){

  fs.readFile('staedte.json', function(err, data){
    if (err) reject(err);
    else {
      var staedteObj = JSON.parse(data);
    }
    fs.readFile('mehr_staedte.json', function(err, data){
      if (err) reject(err);
      else {
        var mehrstaedteObj = JSON.parse(data);
      }
      var allstaedteObj = staedteObj.cities.concat(mehrstaedteObj.cities);
      resolve(allstaedteObj);
    });
  });
});

p.then(function(allstaedteObj){
  console.log(allstaedteObj);
}).catch(function(){
  console.log("Error");
})
