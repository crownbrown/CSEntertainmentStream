module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /*Selects from SQL all billing records for display on main billing page, with date formatting YYYY-MM-DD. */
    function getBillings(res, mysql, context, complete){
        mysql.pool.query("SELECT billingID, billingFullName, unitNumber, IFNULL(unitNumber,'NULL') AS unitNumber, streetName, cityName, stateName, zipCode, creditCardNumber,  date_format(creditCardExpiration, '%m/%d/%Y') AS creditCardExpiration, creditCardSecurityCode FROM Billings", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.billings = results;
            complete();
        });
    }

    /*Selects from SQL all billing records by state for filter/seach, with date formatting YYYY-MM-DD. stateName passed through URL parameter*/
    function getBillingsbyState(req, res, mysql, context, complete){
      var query = "SELECT billingID, billingFullName, unitNumber, streetName, cityName, stateName, zipCode, creditCardNumber, date_format(creditCardExpiration, '%Y-%m-%d') AS creditCardExpiration, creditCardSecurityCode FROM Billings WHERE Billings.stateName = ?";
      console.log(req.params)
      var inserts = [req.params.stateName]
      mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.billings = results;
            complete();
        });
    }

    /*Selects from SQL all billing records by beginning of full name for filter/seach, with date formatting YYYY-MM-DD. fullName passed through URL parameter*/
    function getBillingsWithNameLike(req, res, mysql, context, complete) {
       var query = "SELECT billingID, billingFullName, unitNumber, streetName, cityName, stateName, zipCode, creditCardNumber, date_format(creditCardExpiration, '%Y-%m-%d') AS creditCardExpiration, creditCardSecurityCode FROM Billings WHERE Billings.billingFullName LIKE " + mysql.pool.escape(req.params.s + '%');
      console.log(query)
      mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.billings = results;
            complete();
        });
    }

    /*Selects a SINGLE billing record from SQL for UPDATE/PUT, with date formatting YYYY-MM-DD. billingID passed through URL parameter*/
    function getBilling(res, mysql, context, billingID, complete){
        var sql = "SELECT billingID, billingFullName, unitNumber, streetName, cityName, stateName, zipCode, creditCardNumber, date_format(creditCardExpiration, '%Y-%m-%d') AS creditCardExpiration, creditCardSecurityCode FROM Billings WHERE billingID = ?";
        var inserts = [billingID];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.billing = results[0];
            complete();
        });
    }

    /*Displays all billing records using getBillings above. Responds to GET request to /. Loads delete, filter, and search scripts and renders billings.handlebars*/
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getBillings(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('billings', context);
            }

        }
    });

    /*Displays all billing records with matching stateName using getBillingsbyState above. Responds to GET request to /filter. Loads delete, filter, and search scripts and renders billings.handlebars*/
    router.get('/filter/:stateName', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getBillingsbyState(req,res, mysql, context, complete);
        //getBillings(req,res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('billings', context);
            }

        }
    });

    /*Displays all billing records with with fullName starting with passed string using getBillingsWithNameLike above. Responds to GET request to /search. Loads delete, filter, and search scripts and renders billings.handlebars*/
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getBillingsWithNameLike(req, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('billings', context);
            }
        }
    });

    /*Displays SINGLE billing records using passed billingID for UPDATE using getBilling above above. Responds to GET request to /. Renders update-billings.handlebars*/
    router.get('/:billingID', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["update.js"];
        var mysql = req.app.get('mysql');
        getBilling(res, mysql, context, req.params.billingID, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-billing', context);
            }

        }
    });

    /*INSERT billing record into Billings using passed form data (fields in body and ID in URL param). Responds to POST request to /. Renders billings.handlebars*/
    router.post('/', function(req, res){
        console.log(req.body.homeworld)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Billings (billingFullName, unitNumber, streetName, cityName, stateName, zipCode, creditCardNumber, creditCardExpiration, creditCardSecurityCode) VALUES (?,?,?,?,?,?,?,?,?)";
        var inserts = [req.body.billingFullName, req.body.unitNumber, req.body.streetName, req.body.cityName, req.body.stateName, req.body.zipCode, req.body.creditCardNumber, req.body.creditCardExpiration, req.body.creditCardSecurityCode];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/billings');
            }
        });
    });

    /*UPDATES a billing record using passed form data (fields in body and ID in URL param). Responds to PUT request to /.*/
    router.put('/:billingID', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.billingID)
        var sql = "UPDATE Billings SET billingFullName=?, unitNumber=?, streetName=?, cityName=?, stateName=?, zipCode=?, creditCardNumber=?, creditCardExpiration=?, creditCardSecurityCode=? WHERE billingID=?";
        var inserts = [req.body.billingFullName, req.body.unitNumber, req.body.streetName, req.body.cityName, req.body.stateName, req.body.zipCode, req.body.creditCardNumber, req.body.creditCardExpiration, req.body.creditCardSecurityCode, req.params.billingID];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });

    /*DELETES a billing record using passed billingID in URL param). Responds to DELETE request to /.*/
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Billings WHERE billingID = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })

    return router;
}();
