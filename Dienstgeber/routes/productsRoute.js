module.exports = (function() {
    'use strict';
    var productsRoute = require('express').Router();
    var Product = require('../app/models/product');                             // Verweis auf den Konstruktor Product
    
    // ========================== Produkt ROUTE ====================================
    productsRoute.route('/')

        .post(function(req, res) {                                                  // Ein Produkt erstellen (Zugriff: POST http://localhost:8080/app/products)

            var product = new Product();                                            // Eine neue Instanz von Produkt erstellt
            product.name = req.body.name;                                           // Den Namen wie aus der Request setzen
            product.number = req.body.number;
            product.barcode = req.body.barcode;
            product.class = req.body.class;

            Product.findOne({barcode: product.barcode},function(err, result) {      // Abfrage, ob so ein Produkt schon existiert
              if (err){
                res.status(200).send(err);
              }

              if (result) {
                res.status(200).send('Product already exsist!');
              } else {
                product.save(function(err) {                                        // Speichern des Produkts
                    if (err){
                      res.status(500).send(err);
                    }
                    res.status(201).send('Product created!');
                });
              }
            });
        })
                                                                                    // Alle Produkte (Zugriff: GET http://localhost:8080/app/products)
        .get(function(req, res) {
            Product.find(function(err, product) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(200).send(product);
                }
            });
        });
    // -----------------------------------------------------------------------------
    productsRoute.route('/:product_id')

        .get(function(req, res) {                                                   // Produkt mit der ID (Zugriff GET http://localhost:8080/app/products/:product_id)
            Product.findById(req.params.product_id, function(err, product) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(200).send(product);
                }
            });
        })

        .put(function(req, res) {                                                   // Aktualliesieren (Zugriff PUT http://localhost:8080/app/products/:product_id)
            var responseText = "";
            Product.findById(req.params.product_id, function(err, product) {

                if (err){
                  res.status(500).send(err);
                }
                else {
                  product.name = req.body.name;
                  product.number = req.body.number;
                  product.barcode = req.body.barcode;
                  product.class = req.body.class;                                   // Namen & Menge aktualliesieren

                  if (product.number < 10){
                    responseText = "ATTENTION. NUMBER TOO LOW!!!";                  // Nachricht versenden, wenn zu wenig der Ware vorhanden ist.
                  }
                  else {
                    responseText = "Product updated!";
                  }
                  product.save(function(err) {                                      // Produkt speichern
                      if (err){
                        res.status(500).send(err);
                      }
                      else {
                        res.status(200).send(responseText);
                      }
                  });
                }
            });
        })

        .delete(function(req, res) {                                                // Das Produkt nach der ID gelöscht (Zugriff DELETE http://localhost:8080/app/products/:product_id)

            Product.deleteOne({
                _id: req.params.product_id
            }, function(err, product) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(200).send('Successfully deleted!');
                }
            });
        });

    return productsRoute;
})();
