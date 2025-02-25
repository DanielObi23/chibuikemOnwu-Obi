// listening to clicks on all button with class submit-btn, then passes their id as the url which is then passed to the app.php file
// the app.php file then uses the url to make a request to the api and returns the data to the task.js file, the json file is then shown in the div with id results
$(".submit-btn").click((e) => {
    $.ajax({
        url: "libs/php/app.php",
        type: 'POST',
        dataType: 'json',
        data: {
          url: e.target.id
        },
        success: function(result) {
          console.log(result);
          if (result.status.name == "ok") {
            console.log(result);
            $('#results').html(result['data']);            
          }
          
        },
        error: function(jqXHR, textStatus, errorThrown) {
          $('#results').html("Error with data: " + e.target.id);
        }
      });
});
