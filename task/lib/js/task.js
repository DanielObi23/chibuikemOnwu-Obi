// listening to clicks on all button with class submit-btn, then passes their id as the url which is then passed to the app.php file
// the app.php file then uses the url to make a request to the api and returns the data to the task.js file, the json file is then shown in the div with id results
$("#countryCode").on("submit", function(e) {
  e.preventDefault();
  console.log(`button clicked: countryCode \n long: ${$('#lng').val()} \n lat: ${$('#lat').val()}`);
    $.ajax({
        url: "lib/php/app.php",
        type: 'POST',
        dataType: 'json',
        data: {     
          name: 'countryCode',
          lng: $('#lng').val(),
          lat: $('#lat').val(),
        },
        success: function(result) {
          console.log(result);  
          const data = result.data;
          const countryName = data["countryName"];
          const countryCode = data["countryCode"];
          const languages = data["languages"];
          
          $('#results').html(`<strong>Country Name: </strong>${countryName}<br />
            <strong>Languages: </strong>${languages}<br />
            <strong>Country Code: </strong>${countryCode}<br />`);               
        },
        error: function(jqXHR, textStatus, errorThrown) {
          $('#results').html("Error with data: " + textStatus);
        }
      });
});


$("#countryInfo").on("submit", function(e) {
  e.preventDefault();
  console.log(`button clicked: countryInfo \n country: ${$('#country').val()}`);
    $.ajax({
        url: "lib/php/app.php",
        type: 'POST',
        dataType: 'json',
        data: {     
          name: 'countryInfo',
          country: $('#country').val()
        },
        success: function(result) {
          console.log(result);  
          const data2 = result["data"]["geonames"][0];
          const capital = data2["capital"];
          const languages = data2["languages"];
          const population = data2["population"];
          const continentName = data2["continentName"];
          const currencyCode = data2["currencyCode"];
          $('#results').html(`<strong>Capital: </strong>${capital}<br />
            <strong>Languages: </strong>${languages}<br />
            <strong>Population: </strong>${population}<br />
            <strong>Continent: </strong>${continentName}<br />
            <strong>Currency Code: </strong>${currencyCode}<br />`);               
        },
        error: function(jqXHR, textStatus, errorThrown) {
          $('#results').html("Error with data: " + textStatus);
        }
      });
});


$("#findNearByWeatherJSON").on("submit", function(e) {
  e.preventDefault();
  console.log(`button clicked: findNearByWeatherJSON \n long: ${$('#lng2').val()} \n lat: ${$('#lat2').val()}`);
    $.ajax({
        url: "lib/php/app.php",
        type: 'POST',
        dataType: 'json',
        data: {     
          name: 'findNearByWeatherJSON',
          lng: $('#lng2').val(),
          lat: $('#lat2').val(),
        },
        success: function(result) {
          console.log(result);  
          const data3 = JSON.stringify(result["data"]["status"]["message"]);
          $('#results').html("<p>Message: " + data3 + "</p>");               
        },
        error: function(jqXHR, textStatus, errorThrown) {
          $('#results').html("Error with data: " + textStatus);
        }
      });
});