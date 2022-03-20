module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /*Selects from SQL all series records for display on main Series page.*/
    function getSeries(res, mysql, context, complete){
        mysql.pool.query("SELECT seriesID, seriesName, date_format(uploadDate, '%m/%d/%Y') AS uploadDate FROM Series", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.series = results;
            complete();
        });
    }

    /*Selects from SQL all series records by beginning of series name for filter/seach, with date formatting YYYY-MM-DD. seriesName passed through URL parameter*/
    function getSeriesWithNameLike(req, res, mysql, context, complete) {
      //sanitize the input as well as include the % character
       var query = "SELECT seriesID, seriesName, uploadDate FROM Series WHERE Series.seriesName LIKE " + mysql.pool.escape(req.params.s + '%');
      console.log(query)

      mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.series = results;
            complete();
        });
    }



    /*Selects a SINGLE series record from SQL for UPDATE/PUT, with date formatting YYYY-MM-DD. seriesID passed through URL parameter*/
    function getOneSeries(res, mysql, context, seriesID, complete){
        var sql = "SELECT seriesID, seriesName, date_format(uploadDate, '%Y-%m-%d') AS uploadDate FROM Series WHERE seriesID = ?";
        var inserts = [seriesID];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.series = results[0];
            complete();
        });
    }

    /*Displays all series records using getSeries above. Responds to GET request to /. Loads delete, filter, and search scripts and renders series.handlebars*/
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getSeries(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            //if(callbackCount >= 2){
            if(callbackCount >= 1){
                res.render('series', context);
            }

        }
    });


    /*Displays all series records with with seriesName starting with passed string using getSeriesWithNameLike above. Responds to GET request to /search. Loads delete, filter, and search scripts and renders series.handlebars*/
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getSeriesWithNameLike(req, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('series', context);
            }
        }
    });

    /*Displays SINGLE series record using passed seriesID for UPDATE using getOneSeries above above. Responds to GET request to /. Renders update-series.handlebars*/
    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selected.js", "update.js"];
        var mysql = req.app.get('mysql');
        getOneSeries(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-series', context);
            }

        }
    });

    /*INSERT series record into Series using passed form data (fields in body and ID in URL param). Responds to POST request to /. Renders series.handlebars*/
    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Series (seriesName, uploadDate) VALUES (?,?)";
        var inserts = [req.body.seriesName, req.body.uploadDate];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/series');
            }
        });
    });

    /*UPDATES a series record using passed form data (fields in body and ID in URL param). Responds to PUT request to /.*/
    router.put('/:seriesID', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.seriesID)
        var sql = "UPDATE Series SET seriesName=?, uploadDate=? WHERE seriesID=?";
        var inserts = [req.body.seriesName, req.body.uploadDate, req.params.seriesID];
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

    /*DELETES an series record using passed seriesID in URL param. Responds to DELETE request to /.*/
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Series WHERE seriesID = ?";
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
