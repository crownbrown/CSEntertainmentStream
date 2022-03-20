
/*Calls search function and passes variable*/
function searchBillingsByName() {
    //get the first name 
    var billing_name_search_string  = document.getElementById('billing_name_search_string').value
    //construct the URL and redirect to it
    window.location = '/billings/search/' + encodeURI(billing_name_search_string)
}


function searchEpisodesByName() {
    //get the first name 
    var episode_name_search_string  = document.getElementById('episode_name_search_string').value
    //construct the URL and redirect to it
    window.location = '/episodes/search/' + encodeURI(episode_name_search_string)
}

function searchGenreByDescription() {
    //get the first name 
    var genre_description_search_string  = document.getElementById('genre_description_search_string').value
    //construct the URL and redirect to it
    window.location = '/genres/search/' + encodeURI(genre_description_search_string)
}

function searchMembersByFirstName() {
    //get the first name 
    var member_first_name_search_string  = document.getElementById('member_first_name_search_string').value
    //construct the URL and redirect to it
    window.location = '/members/search/' + encodeURI(member_first_name_search_string)
}


function searchMembersEpisodesByDate() {
    //get the first name 
    var members_episodes_date_search_string  = document.getElementById('members_episodes_date_search_string').value
    //construct the URL and redirect to it
    window.location = '/membersepisodes/search/' + encodeURI(members_episodes_date_search_string)
}


function searchSeriesByName() {
    //get the first name 
    var series_name_search_string  = document.getElementById('series_name_search_string').value
    //construct the URL and redirect to it
    window.location = '/series/search/' + encodeURI(series_name_search_string)
}