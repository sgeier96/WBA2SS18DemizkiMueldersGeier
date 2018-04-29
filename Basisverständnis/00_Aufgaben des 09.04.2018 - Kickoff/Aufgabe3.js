var fs = require('fs');
var chalk = require('chalk');


fs.readFile('staedte.json', function(err, data){

    var obj = JSON.parse(data);                                                         //Aus einer JSON ein Objekt machen
    obj.cities.sort(function(a, b){                                                     //Sortierfunktion aufrufen
        if (a.population < b.population){                                               //Wenn die Population von Land b größer ist als die Population von Land a, wird 1 returned
            return 1;
        }
        if (a.population > b.population){                                               //Wenn die Population von Land a größer ist als die Population von Land b, wird -1 returned
            return -1;
        }
    fs.writeFile('staedte_sortiert.json', JSON.stringify(obj), function(err){});        //Das durch die .sort-Funktion modifizierte Objekt wieder in "JSON-Form" bringen und als staedte_sortiert.json abspeichern
    });

    for (var i = 1; i < 20; i++){                                                       //for-Schleife zum durchlaufen und anzeigen des sortierten Objektes
        console.log(chalk.red("name: "+obj.cities[i].name));
        console.log(chalk.green("country: "+obj.cities[i].country));
        console.log(chalk.cyan("population: "+obj.cities[i].population));
        console.log("----------------------------");
    }
});
