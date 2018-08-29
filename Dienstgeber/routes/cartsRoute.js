module.exports = (function() {
    'use strict';
    var cartsRoute = require('express').Router();
    var Cart = require('../app/models/cart');

    // ============================ Warenkorb ROUTE ================================
    cartsRoute.route('/')

        .get(function(req, res){
          res.status(501).send('Nicht bereitgestellt!');
        })
        .post(function(req, res) {

            var cart = new Cart();
            cart.username = req.body.username;
            cart.orderID = req.body.orderID;
            cart.links = req.body.links;

            Cart.findOne({username: cart.username},function(err, result) {          // Nach dem User Suchen.
              if (err){
                 res.status(500).send(err);
              }

              if (result) {
                res.status(200).send(result);                                       // Cart wird zurückgeschickt
              } else {
                cart.save(function(err) {
                    if (err){
                      res.status(500).send(err);
                    }
                    else {
                      res.status(201).send('Cart created!');
                    }
                });
              }
            });
        });
    // -----------------------------------------------------------------------------
    cartsRoute.route('/:cart_id')

        .get(function(req, res) {
            Cart.findById(req.params.cart_id, function(err, cart) {                 // Nach cart_id suchen
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(200).send(cart);                                       // Warenkorb zurückschicken
                }
            });
        })

        .put(function(req, res) {
            Cart.findByIdAndUpdate(req.params.cart_id,
              {$push:{links: req.body.links}},                                      // Weitere Produkte hinzufügen
              {safe: true, upsert: true, new: true},
              function(err, cart) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  if(cart != null){
                    cart.username = req.body.username;
                    cart.orderID = req.body.orderID;

                    cart.save(function(err) {
                      if (err){
                        res.status(500).send(err);
                      }
                      else {
                        res.status(200).send(cart);
                      }
                    });
                  }
                  else {
                    res.status(500).send(err);
                  }
                }
            });
        });

    return cartsRoute;
})();
