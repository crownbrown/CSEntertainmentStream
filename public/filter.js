
/*Calls filter function and passes variable*/
function filterBillingsByState() {
    //get the id of the selected homeworld from the filter dropdown
    //var stateName = document.getElementById('billings_state_filter').textContent
    var stateName = document.getElementById('billings_state_filter').value
    //construct the URL and redirect to it
    //window.location = '/billings/filter/' + parseInt(stateName)
    window.location = '/billings/filter/' + encodeURI(stateName)
}


function filterEpisodesBySeries() {
    //get the id of the selected homeworld from the filter dropdown
    var seriesID = document.getElementById('episode_series_filter').value
    //construct the URL and redirect to it
    window.location = '/episodes/filter/' + parseInt(seriesID)
}

function filterMembersEpisodesBySeries() {
    //get the id of the selected homeworld from the filter dropdown
    var seriesID = document.getElementById('members_episodes_series_filter').value
    //construct the URL and redirect to it
    window.location = '/membersepisodes/filter/' + parseInt(seriesID)
}

function filterSeriesGenresBySeries() {
    //get the id of the selected homeworld from the filter dropdown
    var seriesID = document.getElementById('series_genres_series_filter').value
    //construct the URL and redirect to it
    window.location = '/seriesgenres/filter/series/' + parseInt(seriesID)
}

function filterSeriesGenresByGenres() {
    //get the id of the selected homeworld from the filter dropdown
    var genreID = document.getElementById('series_genres_genres_filter').value
    //construct the URL and redirect to it
    window.location = '/seriesgenres/filter/genres/' + parseInt(genreID)
}