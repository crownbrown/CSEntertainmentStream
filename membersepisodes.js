module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /*Selects from SQL all episode records for display on main MembersEpisodes page as FK. */
    function getEpisodes(res, mysql, context, complete){
        mysql.pool.query("SELECT episodeID, episodeName, episodeNumber, length, uploadDate, seriesID FROM Episodes", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.episodes = results;
            complete();
        });
    }

    /*Selects from SQL all series records for display on main MembersEpisodes page as FK. */
    function getSeries(res, mysql, context, complete){
        mysql.pool.query("SELECT seriesID, seriesName, uploadDate FROM Series", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.series = results;
            complete();
        });
    }

    /*Selects from SQL all member records for display on main MembersEpisodes page as FK. */
    function getMembers(res, mysql, context, complete){
        mysql.pool.query("SELECT userID, firstName, lastName, email, billingID, userLogIn, password FROM Members", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.members = results;
            complete();
        });
    }

    /*Selects from SQL all membersepisodes for display on main MembersEpisodes page, with date formatting YYYY-MM-DD.*/
    function getMembersEpisodes(res, mysql, context, complete){
        mysql.pool.query("SELECT membersEpisodesID, date_format(viewDate, '%m/%d/%Y') AS viewDate, userID, episodeID FROM MembersEpisodes", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.membersepisodes = results;
            complete();
        });
    }

    /*Selects from SQL all membersepisode records by series for filter/seach, with date formatting YYYY-MM-DD. seriesID passed through URL parameter*/
    function getMembersEpisodesbySeries(req, res, mysql, context, complete){
      var query = "SELECT membersEpisodesID, date_format(viewDate, '%Y-%m-%d') AS viewDate, userID, Episodes.episodeID FROM MembersEpisodes LEFT JOIN Episodes ON MembersEpisodes.episodeID = Episodes.episodeID LEFT JOIN Series ON Series.seriesID = Episodes.episodeID WHERE Series.seriesID = ?";
      console.log(req.params)
      var inserts = [req.params.seriesID]
      mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.membersepisodes = results;
            complete();
        });
    }

    /*Selects from SQL all membersepisodes records by beginning of viewDate for filter/seach, with date formatting YYYY-MM-DD. viewDate passed through URL parameter*/
    function getMembersEpisodesWithDateLike(req, res, mysql, context, complete) {
      //sanitize the input as well as include the % character
       var query = "SELECT membersEpisodesID, date_format(viewDate, '%Y-%m-%d') AS viewDate, userID, episodeID FROM MembersEpisodes WHERE MembersEpisodes.viewDate LIKE " + mysql.pool.escape(req.params.s + '%');
      console.log(query)

      mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.membersepisodes = results;
            complete();
        });
    }


    /*Selects a SINGLE membersepisode record from SQL for UPDATE/PUT, with date formatting YYYY-MM-DD. membersEpisodesID passed through URL parameter*/
    function getMembersEpisode(res, mysql, context, membersEpisodesID, complete){
        var sql = "SELECT membersEpisodesID, date_format(viewDate, '%Y-%m-%d') AS viewDate, episodeID, userID FROM MembersEpisodes WHERE membersEpisodesID = ?";
        var inserts = [membersEpisodesID];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.membersepisode = results[0];
            complete();
        });
    }

    /*Displays all membersepisode records, including series, using getSeries, getMembers, getEpisodes, and getMembersEpisodes above. Responds to GET request to /. Loads delete, filter, and search scripts and renders membersepisodes.handlebars*/
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getMembers(res, mysql, context, complete);
        getSeries(res, mysql, context, complete);
        getEpisodes(res, mysql, context, complete);
        getMembersEpisodes(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            //if(callbackCount >= 2){
            if(callbackCount >= 4){
                res.render('membersepisodes', context);
            }

        }
    });

    /*Displays all membersepisode records with matching seriesID using getMembersEpisodesbySeries and getSeries above. Responds to GET request to /filter. Loads delete, filter, and search scripts and renders membersepisodes.handlebars*/
    router.get('/filter/:seriesID', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getMembersEpisodesbySeries(req,res, mysql, context, complete);
        getSeries(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('membersepisodes', context);
            }

        }
    });

    /*Displays all membersepisode records with with episodeName starting with passed string using getMembersEpisodesWithDateLike above. Responds to GET request to /search. Loads delete, filter, and search scripts and renders membersepisodes.handlebars*/
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js"];
        var mysql = req.app.get('mysql');
        getMembersEpisodesWithDateLike(req, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('membersepisodes', context);
            }
        }
    });

    /*Displays SINGLE membersepisode record using passed membersEpisodesID for UPDATE using getSeries, getMembers, getEpisodes, and getMembersEpisodes above. Responds to GET request to /. Renders update-membersepisode.handlebars*/
    router.get('/:membersEpisodesID', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selected.js", "update.js"];
        var mysql = req.app.get('mysql');
        getMembersEpisode(res, mysql, context, req.params.membersEpisodesID, complete);
        getSeries(res, mysql, context, complete);
        getMembers(res, mysql, context, complete);
        getEpisodes(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 4){
                res.render('update-membersepisode', context);
            }

        }
    });

    /*INSERT membersepisode record into MembersEpisodes using passed form data (fields in body and ID in URL param). Responds to POST request to /. Renders membersepisodes.handlebars*/
    router.post('/', function(req, res){
        console.log(req.body.homeworld)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO MembersEpisodes (viewDate, episodeID, userID) VALUES (?,?,?)";
        var inserts = [req.body.viewDate, req.body.episodeID, req.body.userID];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/membersepisodes');
            }
        });
    });

    /*UPDATES a membersepisode record using passed form data (fields in body and ID in URL param). Responds to PUT request to /.*/
    router.put('/:membersEpisodesID', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.membersEpisodesID)
        var sql = "UPDATE MembersEpisodes SET viewDate=?, episodeID=?, userID=? WHERE membersEpisodesID=?";
        var inserts = [req.body.viewDate, req.body.episodeID, req.body.userID, req.params.membersEpisodesID];
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

    /*DELETES an memnbersepisode record using passed membersEpisodesID in URL param. Responds to DELETE request to /.*/
    router.delete('/:membersEpisodesID', function(req, res){
        //console.log(req) //I used this to figure out where did pid and cid go in the request
        console.log(req.params.membersEpisodesID)
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM MembersEpisodes WHERE membersEpisodesID = ?";
        var inserts = [req.params.membersEpisodesID];
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
