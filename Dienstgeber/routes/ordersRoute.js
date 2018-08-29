module.exports = (function() {
    'use strict';
    var ordersRoute = require('express').Router();
    var Order = require('../app/models/order');

// ============================ Auftrags ROUTE =================================
    ordersRoute.route('/')

        .post(function(req, res) {                                              // Einen Auftrag erstellen (Zugriff: POST http://localhost:8080/orders)

            var order = new Order();
            order.orderName = req.body.orderName;
            order.description = req.body.description;
            order.username = req.body.username;
            order.products = req.body.products;

            Order.findOne({orderName: order.orderName},function(err, result) {  // Abfrage, ob so ein Auftrag schon existiert
              if (err){
                res.status(500).send(err);
              }
              if (result) {
                res.status(200).send('Order already exsist!');
              } else {
                order.save(function(err) {
                    if (err){
                      res.status(500).send(err);
                    }
                    else {
                      res.status(200).send(order);
                    }
                });
              }
            });
        })

        .get(function(req, res) {                                               // Alle Aufträge (Zugriff: GET http://localhost:8080/orders)
            Order.find(function(err, order) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(200).send(order);
                }
            });
        });
// -----------------------------------------------------------------------------
    ordersRoute.route('/:order_id')

        .get(function(req, res) {                                               // Auftrag mit der ID (Zugriff GET http://localhost:8080/orders/:order_id)
            Order.findById(req.params.order_id, function(err, order) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(200).send(order);
                }
            });
        })

        .put(function(req, res) {                                               // Aktualliesieren (Zugriff PUT http://localhost:8080/orders/:order_id)

            Order.findById(req.params.order_id, function(err, order) {

                if (err){
                  res.status(500).send(err);
                }
                else {
                  order.orderName = req.body.orderName;
                  order.description = req.body.description;
                  order.username = req.body.username;
                  order.products = req.body.products;

                  order.save(function(err) {
                    if (err){
                      res.status(500).send(err);
                    }
                    else {
                      res.status(200).send('Order updated!');
                    }
                  });
                }
            });
        })

        .delete(function(req, res) {                                            // Der Auftrag nach der ID gelöscht (Zugriff DELETE http://localhost:8080/orders/:order_id)

            Order.deleteOne({
                _id: req.params.order_id
            }, function(err, order) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(200).send('Successfully deleted');
                }
            });
        });

    return ordersRoute;
})();
