var fs = require('fs');
var chalk = require('chalk');

fs.readFile('staedte.json', function(err, data) {

var stadtObj = JSON.parse(data);

for(var i = 0; i < stadtObj.cities.length; i++)
{
  console.log(
				'\n','-------------','\n',
				chalk.red('\n', 'name: ', stadtObj.cities[i].name),
				chalk.green('\n', 'country: ', stadtObj.cities[i].country),
				chalk.cyan('\n', 'population: ', stadtObj.cities[i].population)
			  );
}

});

