module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /*Selects from SQL all billing records for display on main Members page as FK. */
    function getBillings(res, mysql, context, complete){
        mysql.pool.query("SELECT billingID, billingFullName FROM Billings", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.billings  = results;
            complete();
        });
    }

    /*Selects from SQL all members for display on main Members page.*/
    function getMembers(res, mysql, context, complete){
        // if req.body.billingID === "NULL" => req.body.billingID === null;
        // req.body.billingID === null;
        // if (req.body.billingID === "NULL") {req.body.billingID = NULL;}
        mysql.pool.query("SELECT userID, firstName, lastName, email, billingID,IFNULL(billingID,'NULL') AS billingID, userLogIn, password FROM Members", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.members = results;
            // req.body.billingID = null;
            complete();
        });
    }


    /*Selects from SQL all member records by beginning of first name for filter/seach. firstName search string passed through URL parameter*/
    function getMembersWithFirstNameLike(req, res, mysql, context, complete) {
      var query = "SELECT userID, firstName, lastName, email, billingID, userLogIn, password FROM Members WHERE Members.firstName LIKE " + mysql.pool.escape(req.params.s + '%');
      console.log(query)

      mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.members = results;
            complete();
        });
    }


    /*Selects a SINGLE member record from SQL for UPDATE/PUT. memberID passed through URL parameter*/
    function getMember(res, mysql, context, userID, complete){
        // if req.body.billingID === "NULL" => req.body.billingID === null;
        var sql = "SELECT userID, firstName, lastName, email, billingID, userLogIn, password FROM Members WHERE userID = ?";
        var inserts = [userID];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.member = results[0];
            complete();
        });
    }

    /*Displays all mmeber records, including billingID, using getBillings and getMembers above. Responds to GET request to /. Loads delete, filter, and search scripts and renders members.handlebars*/
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getBillings(res, mysql, context, complete);
        getMembers(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            //if(callbackCount >= 2){
            if(callbackCount >= 2){
                res.render('members', context);
            }

        }
    });



    /*Displays all member records with with firstName starting with passed string using getMembersWithFirstNameLike above. Responds to GET request to /search. Loads delete, filter, and search scripts and renders members.handlebars*/
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getMembersWithFirstNameLike(req, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('members', context);
            }
        }
    });

    /* Display one person for the specific purpose of updating people */

    router.get('/:userID', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selected.js", "update.js"];
        var mysql = req.app.get('mysql');
        getMember(res, mysql, context, req.params.userID, complete);
        getBillings(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-member', context);
            }

        }
    });

    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        console.log(req.body.homeworld)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Members (firstName, lastName, email, billingID, userLogIn, password) VALUES (?,?,?,?,?,?)";
        var inserts = [req.body.firstName, req.body.lastName, req.body.email, req.body.billingID, req.body.userLogIn, req.body.password];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/members');
            }
        });
    });

    /* The URI that update data is sent to in order to update a person */

    router.put('/:userID', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.userID)
        var sql = "UPDATE Members SET firstName=?, lastName=?, email=?, billingID=?, userLogIn=?, password=? WHERE userID=?";
        var inserts = [req.body.firstName, req.body.lastName, req.body.email, req.body.billingID, req.body.userLogIn, req.body.password, req.params.userID];
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

    /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Members WHERE userID = ?";
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
