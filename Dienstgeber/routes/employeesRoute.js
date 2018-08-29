module.exports = (function() {
    'use strict';
    var employeesRoute = require('express').Router();
    var Employee = require('../app/models/employee');

    // ========================== Mitarbeiter ROUTE ================================
    employeesRoute.route('/')

        .post(function(req, res) {                                                  // Einen Mitarbeiter erstellen (Zugriff: POST http://localhost:8080/app/employees)

            var employee = new Employee();
            employee.name = req.body.name;
            employee.surname = req.body.surname;
            employee.address = req.body.address;
            employee.age = req.body.age;
            employee.username = req.body.username;
            employee.password = req.body.password;
            employee.rank = req.body.rank;
            employee.approval = req.body.approval;
            employee.orderID = req.body.orderID;

            Employee.findOne({username: employee.username},function(err, result) {  // Abfrage, ob so ein Mitarbeiter schon existiert
              if (err){
                res.status(500).send(err);
              }

              if (result) {
                res.status(200).send('Employee already exsist!');
              } else {
                employee.save(function(err) {
                    if (err){
                      res.status(500).send(err);
                    }
                    else {
                      res.status(201).send('Employee created!');
                    }
                });
              }
            });
        })

        .get(function(req, res) {                                                   // Alle Mitarbeiter (Zugriff: GET http://localhost:8080/app/employees)
            Employee.find(function(err, employee) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(200).send(employee);
                }
            });
        });
    // -----------------------------------------------------------------------------
    employeesRoute.route('/:employee_id')

        .get(function(req, res) {                                                   // Mitarbeiter mit der ID (Zugriff GET http://localhost:8080/app/employees/:employee_id)
            Employee.findById(req.params.employee_id, function(err, employee) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(200).send(employee);
                }
            });
        })

        .put(function(req, res) {                                                   // Aktualliesieren (Zugriff PUT http://localhost:8080/app/employees/:employee_id)

            Employee.findById(req.params.employee_id, function(err, employee) {

                if (err){
                  res.status(500).send(err);
                }
                else {
                  employee.name = req.body.name;
                  employee.surname = req.body.surname;
                  employee.address = req.body.address;
                  employee.age = req.body.age;
                  employee.username = req.body.username;
                  employee.password = req.body.password;
                  employee.rank = req.body.rank;
                  employee.approval = req.body.approval;
                  employee.orderID = req.body.orderID;

                  employee.save(function(err) {
                    if (err){
                      res.status(500).send(err);
                    }
                    else {
                      res.status(200).send('Employee updated!');
                    }
                  });
                }
            });
        })

        .delete(function(req, res) {                                                // Den Mitarbeiter nach der ID gelöscht (Zugriff DELETE http://localhost:8080/app/employees/:employee_id)

            Employee.deleteOne({
                _id: req.params.employee_id
            }, function(err, employee) {
                if (err){
                  res.status(500).send(err);
                }
                else {
                  res.status(200).send('Successfully deleted');
                }
            });
        });

    return employeesRoute;
})();
