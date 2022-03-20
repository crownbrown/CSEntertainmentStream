module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /*Selects from SQL all series records for display on main Episodes page as FK. */
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

    /*Selects from SQL all episodes for display on main Episodes page, with date formatting YYYY-MM-DD.*/
    function getEpisodes(res, mysql, context, complete){
        mysql.pool.query("SELECT episodeID, episodeName, episodeNumber, length, date_format(uploadDate, '%Y-%m-%d') AS uploadDate, seriesID FROM Episodes", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.episodes = results;
            complete();
        });
    }

    /*Selects from SQL all episode records by series for filter/seach, with date formatting YYYY-MM-DD. seriesID passed through URL parameter*/
    function getEpisodesbySeries(req, res, mysql, context, complete){
      var query = "SELECT episodeID, episodeName, episodeNumber, length, date_format(uploadDate, '%Y-%m-%d') AS uploadDate, seriesID FROM Episodes WHERE Episodes.seriesID = ?";
      console.log(req.params)
      var inserts = [req.params.seriesID]
      mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.episodes = results;
            complete();
        });
    }

    /*Selects from SQL all episodes records by beginning of episode name for filter/seach, with date formatting YYYY-MM-DD. episodeName passed through URL parameter*/
    function getEpisodesWithNameLike(req, res, mysql, context, complete) {
      //sanitize the input as well as include the % character
       var query = "SELECT episodeID, episodeName, episodeNumber, length, date_format(uploadDate, '%Y-%m-%d') AS uploadDate, seriesID FROM Episodes WHERE Episodes.episodeName LIKE" + mysql.pool.escape(req.params.s + '%');
      console.log(query)

      mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.episodes = results;
            complete();
        });
    }

    /*Selects a SINGLE episode record from SQL for UPDATE/PUT, with date formatting YYYY-MM-DD. episodeID passed through URL parameter*/
    function getEpisode(res, mysql, context, episodeID, complete){
        var sql = "SELECT episodeID as episodeID, episodeName, episodeNumber, length, date_format(uploadDate, '%Y-%m-%d') AS uploadDate, seriesID FROM Episodes WHERE episodeID = ?";
        var inserts = [episodeID];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.episode = results[0];
            complete();
        });
    }

     /*Displays all episode records, including series, using getSeries and getEpisodes above. Responds to GET request to /. Loads delete, filter, and search scripts and renders episodes.handlebars*/
     router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getSeries(res, mysql, context, complete);
        getEpisodes(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            //if(callbackCount >= 2){
            if(callbackCount >= 2){
                res.render('episodes', context);
            }

        }
    });

    /*Displays all episode records with matching seriesID using getEpisodesbySeries and getSeries above. Responds to GET request to /filter. Loads delete, filter, and search scripts and renders episodes.handlebars*/
    router.get('/filter/:seriesID', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getEpisodesbySeries(req,res, mysql, context, complete);
        getSeries(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('episodes', context);
            }

        }
    });




    /*Displays all episode records with with episodeName starting with passed string using getEpisodesWithNameLike above. Responds to GET request to /search. Loads delete, filter, and search scripts and renders episodes.handlebars*/
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getEpisodesWithNameLike(req, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('episodes', context);
            }
        }
    });

    
    /*Displays SINGLE episode record using passed episodeID for UPDATE using getEpisode and getSeries above above. Responds to GET request to /. Renders update-episode.handlebars*/
    router.get('/:episodeID', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selected.js", "update.js"];
        var mysql = req.app.get('mysql');
        getEpisode(res, mysql, context, req.params.episodeID, complete);
        getSeries(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-episode', context);
            }

        }
    });

    /*INSERT episode record into Episodes using passed form data (fields in body and ID in URL param). Responds to POST request to /. Renders episodes.handlebars*/
    router.post('/', function(req, res){
        console.log(req.body.seriesID)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Episodes (episodeName, episodeNumber, length, uploadDate, seriesID) VALUES (?,?,?,?,?)";
        var inserts = [req.body.episodeName, req.body.episodeNumber, req.body.length, req.body.uploadDate, req.body.seriesID];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/episodes');
            }
        });
    });


    /*UPDATES a episode record using passed form data (fields in body and ID in URL param). Responds to PUT request to /.*/
    router.put('/:episodeID', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.episodeID)
        var sql = "UPDATE Episodes SET episodeName=?, episodeNumber=?, length=?, uploadDate=?, seriesID=? WHERE episodeID=?";
        var inserts = [req.body.episodeName, req.body.episodeNumber, req.body.length, req.body.uploadDate, req.body.seriesID, req.params.episodeID];
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

    /*DELETES an episode record using passed episodeID in URL param. Responds to DELETE request to /.*/
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Episodes WHERE episodeID = ?";
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
