module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /*Selects from SQL all series records for display on main SeriesGenres page as FK. */
    function getSeries(res, mysql, context, complete){
        mysql.pool.query("SELECT seriesID, seriesName FROM Series", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.series  = results;
            complete();
        });
    }

    /*Selects from SQL all genres records for display on main SeriesGenres page as FK. */
    function getGenres(res, mysql, context, complete){
        mysql.pool.query("SELECT genreID, genreDescription FROM Genres", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.genres  = results;
            complete();
        });
    }


    /*Selects from SQL all seriesgenres for display on main SeriesGenres page.*/
    function getSeriesGenres(res, mysql, context, complete){
        mysql.pool.query("SELECT seriesGenresID, seriesID, genreID FROM SeriesGenres", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.seriesgenres = results;
            complete();
        });
    }


    /*Selects from SQL all seriesgenres records by series for filter/seach. seriesID passed through URL parameter*/
    function getSeriesGenresbySeries(req, res, mysql, context, complete) {
       var query = "SELECT seriesGenresID, seriesID, genreID FROM SeriesGenres WHERE SeriesGenres.seriesID = ?";
       console.log(req.params)
       var inserts = [req.params.seriesID]
       mysql.pool.query(query, inserts, function(error, results, fields){
             if(error){
                 res.write(JSON.stringify(error));
                 res.end();
             }
             context.seriesgenres = results;
             complete();
         });
     }


    /*Selects from SQL all seriesgenres records by genres for filter/seach. sgenreID passed through URL parameter*/
    function getSeriesGenresbyGenres(req, res, mysql, context, complete) {
        //sanitize the input as well as include the % character
            var query = "SELECT seriesGenresID, seriesID, genreID FROM SeriesGenres WHERE SeriesGenres.genreID = ?";
            console.log(req.params)
            var inserts = [req.params.genreID]
            mysql.pool.query(query, inserts, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.seriesgenres = results;
                complete();
            });
        }


    /*Selects a SINGLE seriesgenre record from SQL for UPDATE/PUT. seriesGenresID passed through URL parameter*/
    function getSeriesGenre(res, mysql, context, seriesGenresID, complete){
        var sql = "SELECT seriesGenresID, seriesID, genreID FROM SeriesGenres WHERE seriesGenresID = ?";
        var inserts = [seriesGenresID];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.seriesgenre = results[0];
            complete();
        });
    }

    /*Displays all seriesgenres records, including series and genres, using getSeries, getGenres, and getSeriesGenres above. Responds to GET request to /. Loads delete, filter, and search scripts and renders seriesgenres.handlebars*/
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getSeries(res, mysql, context, complete);
        getGenres(res, mysql, context, complete);
        getSeriesGenres(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            //if(callbackCount >= 2){
            if(callbackCount >= 3){
                res.render('seriesgenres', context);
            }

        }
    });

    /*Displays all seriesgenres records with matching seriesID using getSeriesGenresbySeries above. Responds to GET request to /filter. Loads delete, filter, and search scripts and renders seriesgenres.handlebars*/
    router.get('/filter/series/:seriesID', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getSeriesGenresbySeries(req,res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('seriesgenres', context);
            }

        }
    });


    /*Displays all seriesgenres records with matching genreID using getSeriesGenresbyGenres above. Responds to GET request to /filter. Loads delete, filter, and search scripts and renders seriesgenres.handlebars*/
    router.get('/filter/genres/:genreID', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getSeriesGenresbyGenres(req,res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('seriesgenres', context);
            }

        }
    });


    /*Displays SINGLE seriesgenre record using passed seriesGenresID for UPDATE using getSeries, getSeries, and getSeriesGenre above above. Responds to GET request to /. Renders update-seriesgenre.handlebars*/
    router.get('/:seriesGenresID', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selected.js", "update.js"];
        var mysql = req.app.get('mysql');
        getSeriesGenre(res, mysql, context, req.params.seriesGenresID, complete);
        getSeries(res, mysql, context, complete);
        getGenres(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('update-seriesgenre', context);
            }

        }
    });

    /*INSERT seriesgenre record into SeriesGenres using passed form data (fields in body and ID in URL param). Responds to POST request to /. Renders seriesgenres.handlebars*/
    router.post('/', function(req, res){
        console.log(req.body.seriesgenres)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO SeriesGenres (seriesID, genreID) VALUES (?,?)";
        var inserts = [req.body.seriesID, req.body.genreID];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/seriesgenres');
            }
        });
    });

    /*UPDATES a seriesgenre record using passed form data (fields in body and ID in URL param). Responds to PUT request to /.*/
    router.put('/:seriesGenresID', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.seriesGenresID)
        var sql = "UPDATE SeriesGenres SET seriesID=?, genreID=? WHERE seriesGenresID=?";
        var inserts = [req.body.seriesID, req.body.genreID, req.params.seriesGenresID];
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

    /*DELETES a seriesgenre record using passed seriesGenresID in URL param. Responds to DELETE request to /.*/
    router.delete('/:seriesGenresID', function(req, res){
        //console.log(req) //I used this to figure out where did pid and cid go in the request
        console.log(req.params.seriesGenresID)
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM SeriesGenres WHERE seriesGenresID = ?";
        var inserts = [req.params.seriesGenresID];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
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
