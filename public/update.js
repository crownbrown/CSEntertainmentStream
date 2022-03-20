/*Script that responds to Update link on a sigle record, serializing the passed for data*/
function updateMember(userID){
    $.ajax({
        url: '/members/' + userID,
        type: 'PUT',
        data: $('#update-member').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};


function updateGenre(id){
    $.ajax({
        url: '/genres/' + id,
        type: 'PUT',
        data: $('#update-genre').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};

function updateOneSeries(seriesID){
    $.ajax({
        url: '/series/' + seriesID,
        type: 'PUT',
        data: $('#update-series').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};



function updateBilling(billingID){
    $.ajax({
        url: '/billings/' + billingID,
        type: 'PUT',
        data: $('#update-billing').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};



function updateEpisode(episodeID){
    $.ajax({
        url: '/episodes/' + episodeID,
        type: 'PUT',
        data: $('#update-episode').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};


function updateSeriesGenres(seriesGenresID){
    $.ajax({
        url: '/seriesgenres/' + seriesGenresID,
        type: 'PUT',
        data: $('#update-seriesgenre').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};



function updateMembersEpisode(membersEpisodesID){
    $.ajax({
        url: '/membersepisodes/' + membersEpisodesID,
        type: 'PUT',
        data: $('#update-membersepisode').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};


