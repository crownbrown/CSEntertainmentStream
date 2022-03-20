/*Passes ID of deleted record to correct route.*/
function deleteBillings(id){
  $.ajax({
      url: '/billings/' + id,
      type: 'DELETE',
      success: function(result){
          window.location.reload(true);
      }
  })
};

function deleteMembers(id){
  $.ajax({
      url: '/members/' + id,
      type: 'DELETE',
      success: function(result){
          window.location.reload(true);
      }
  })
};

function deleteEpisodes(id){
  $.ajax({
      url: '/episodes/' + id,
      type: 'DELETE',
      success: function(result){
          window.location.reload(true);
      }
  })
};

function deleteSeries(id){
  $.ajax({
      url: '/series/' + id,
      type: 'DELETE',
      success: function(result){
          window.location.reload(true);
      }
  })
};

function deleteGenres(id){
  $.ajax({
      url: '/genres/' + id,
      type: 'DELETE',
      success: function(result){
          window.location.reload(true);
      }
  })
};

function deleteSeriesGenres(seriesGenresID){
  $.ajax({
      url: '/seriesgenres/' + seriesGenresID,
      type: 'DELETE',
      success: function(result){
          window.location.reload(true);
      }
  })
};

function deleteMembersEpisodes(membersEpisodesID){
  $.ajax({
      url: '/membersepisodes/' + membersEpisodesID,
      type: 'DELETE',
      success: function(result){
          window.location.reload(true);
      }
  })
};