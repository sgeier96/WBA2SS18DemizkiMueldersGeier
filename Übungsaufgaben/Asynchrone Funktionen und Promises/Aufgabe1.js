var fs = require('fs');

fs.readFile('staedte.json', function(err, data){

  var staedteObj = JSON.parse(data);

  fs.readFile('mehr_staedte.json', function(err, data){

    var mehrstaedteObj = JSON.parse(data);
    var allstaedteObj = staedteObj.cities.concat(mehrstaedteObj.cities);

    console.log(allstaedteObj);
  });
});
