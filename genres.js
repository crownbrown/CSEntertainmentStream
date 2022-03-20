module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /*Selects from SQL all genres for display on main Genres page.*/
    function getGenres(res, mysql, context, complete){
        mysql.pool.query("SELECT Genres.genreID as id, genreDescription FROM Genres", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.genres = results;
            complete();
        });
    }

    /*Selects from SQL all genres records by beginning of genre name for filter/seach. genreName passed through URL parameter*/
    function getGenresWithDescriptionLike(req, res, mysql, context, complete) {
       var query = "SELECT Genres.genreID as id, genreDescription FROM Genres WHERE Genres.genreDescription LIKE " + mysql.pool.escape(req.params.s + '%');
      console.log(query)
      mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.genres = results;
            complete();
        });
    }

    /*Selects a SINGLE genre record from SQL for UPDATE/PUT. genreID passed through URL parameter*/
    function getGenre(res, mysql, context, id, complete){
        var sql = "SELECT genreID as id, genreDescription FROM Genres WHERE genreID = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.genre = results[0];
            complete();
        });
    }

    /*Displays all genre records using getGenres above. Responds to GET request to /. Loads delete, filter, and search scripts and renders genres.handlebars*/
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getGenres(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            //if(callbackCount >= 2){
            if(callbackCount >= 1){
                res.render('genres', context);
            }

        }
    });


    /*Displays all genre records with with genreDescription starting with passed string using getGenresWithDescriptionLike above. Responds to GET request to /search. Loads delete, filter, and search scripts and renders genres.handlebars*/
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getGenresWithDescriptionLike(req, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('genres', context);
            }
        }
    });

    /*Displays SINGLE genre records using passed genreID for UPDATE using getGenre above above. Responds to GET request to /. Renders update-genres.handlebars*/
    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["update.js"];
        var mysql = req.app.get('mysql');
        getGenre(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-genre', context);
            }

        }
    });


    /*INSERT genre record into Genres using passed form data (fields in body and ID in URL param). Responds to POST request to /. Renders genres.handlebars*/
    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Genres (genreID, genreDescription) VALUES (?,?)";
        var inserts = [req.body.genreID, req.body.genreDescription];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/genres');
            }
        });
    });


    /*UPDATES a genre record using passed form data (fields in body and ID in URL param). Responds to PUT request to /.*/
    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.id)
        var sql = "UPDATE Genres SET genreDescription=? WHERE genreID=?";
        var inserts = [req.body.genreDescription, req.params.id];
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

    /*DELETES a genre record using passed genreID in URL param). Responds to DELETE request to /.*/
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Genres WHERE genreID = ?";
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
