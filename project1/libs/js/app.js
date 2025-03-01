var map;

var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
  }
);

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  }
);

var basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

function formatToHeaderSyntax(text) {
  const encoded = encodeURIComponent(text);
  return encoded.replace(/%20/g, '+'); // for better readability in console
}

function makeAjaxRequest(name, successCallback) {
  $.ajax({
    url: "libs/php/app.php",
    type: 'POST',
    dataType: 'json',
    data: {   
      name: name, 
      country: formatToHeaderSyntax($("#countrySelect option:selected").text())
    },
    success: function(result) {
      console.log($("#countrySelect option:selected").val());
      console.log("Result:", result);
      successCallback(result);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Error with data: " + textStatus);
    }
  });
}

var infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
  $("#loadingOverlay").show();
    makeAjaxRequest("countryDetails", function(result) {
      $("#loadingOverlay").hide();
      const countryData = result.data[0];
      const countryDataKeys = Object.keys(countryData);
      $('#dataTable').html('')
      countryDataKeys.forEach((key, index) => {
        if (key !== "currency") {
          $('#countryDetailsModal .table').append(`
            <tr class="${index % 2 === 0 ? 'bg-success' : ''} m-3">
                <td class="${index % 2 === 0 ? 'fw-bold' : 'fw-bold text-success'}">
                  &nbsp;${key}
                </td>
    
                <td class="text-end py-2 ${index % 2 === 0 ? 'fw-bold' : 'fw-bold text-success'}">
                  ${countryData[key]? countryData[key] : "N/A"}
                </td>
    
              </tr>
          `);
        } else {
          $('#countryDetailsModal .table').append(`
            <tr>
  
                <td class="fw-bold text-success">
                  &nbsp;${key}
                </td>
    
                <td class="text-end fw-bold text-success">
                  ${countryData[key].name}, ${countryData[key].code}
                </td>
    
              </tr>
          `);
        };
      })
      new bootstrap.Modal($('#countryDetailsModal')).show();
    });
});
function loadCountryBorder(countryCode) {
  // Clear any existing borders
  if (window.borderLayer) {
    map.removeLayer(window.borderLayer);
  }
  
  // Show loading overlay
  $("#loadingOverlay").show();
  
  // Fetch GeoJSON data for the selected country
  $.ajax({
    url: 'libs/php/countryBorder.php',
    type: 'POST',
    dataType: 'json',
    data: {
      country: countryCode
    },
    success: function(result) {
      // Hide loading overlay
      $("#loadingOverlay").hide();
      
      if (result.status.code === 200 && result.data) {
        // Define style for the country border
        var borderStyle = {
          color: "#ff7800",
          weight: 3,
          opacity: 0.8,
          fillColor: "#ffa500",
          fillOpacity: 0.1
        };
        
        // Create the GeoJSON layer with the border
        window.borderLayer = L.geoJSON(result.data, {
          style: borderStyle
        }).addTo(map);
        
        // Fit the map to the border bounds
        map.fitBounds(window.borderLayer.getBounds());
      } else {
        // Show error toast
        Toastify({
          text: "Could not load border for selected country",
          duration: 3000,
          gravity: "top",
          position: "center",
          backgroundColor: "#ff4444"
        }).showToast();
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // Hide loading overlay
      $("#loadingOverlay").hide();
      
      // Show error toast
      Toastify({
        text: "Error loading country border: " + textStatus,
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#ff4444"
      }).showToast();
      
      console.log("Error with border data: " + textStatus);
    }
  });
}

function loadAirports(countryCode) {
  $("#loadingOverlay").show();
  
  $.ajax({
    url: 'libs/php/getAirports.php',
    type: 'POST',
    dataType: 'json',
    data: {   
      name: "airportList",
      country: countryCode
    },
    success: function(result) {
      $("#loadingOverlay").hide();
      
      if (result.status.code === 200 && result.data) {
        if (!window.airportMarkers) {
          window.airportMarkers = L.markerClusterGroup();
        } else {
          window.airportMarkers.clearLayers();
        }
        
        var airportIcon = L.ExtraMarkers.icon({
          icon: 'fa-plane',
          markerColor: 'white',
          shape: 'square',
          prefix: 'fa'
        });
        
        result.data.forEach(function(airport) {
          var marker = L.marker([airport.latitude, airport.longitude], {
            icon: airportIcon
          });
          
          var popupContent = `
            <div class="airport-popup">
              <h5>${airport.name}</h5>
              <p><strong>ICAO:</strong> ${airport.icao}</p>
              <p><strong>City:</strong> ${airport.city}</p>
              <p><strong>Region:</strong> ${airport.region}</p>
              <p><strong>Elevation:</strong> ${airport.elevation_ft} ft</p>
            </div>
          `;
          
          marker.bindPopup(popupContent);
          window.airportMarkers.addLayer(marker);
        });
        
        // Add the marker cluster group to the map
        map.addLayer(window.airportMarkers);
        
        // Show success toast
        Toastify({
          text: `Loaded ${result.data.length} airports for ${$("#countrySelect option:selected").text()}`,
          duration: 3000,
          gravity: "top",
          position: "center",
          backgroundColor: "#28a745"
        }).showToast();
      } else {
        // Show error toast
        Toastify({
          text: "Error loading airports",
          duration: 3000,
          gravity: "top",
          position: "center",
          backgroundColor: "#ff4444"
        }).showToast();
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $("#loadingOverlay").hide();
      
      // Show error toast
      Toastify({
        text: "Error fetching airport data: " + textStatus,
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "#ff4444"
      }).showToast();
      
      console.log("Error with airport data: " + textStatus);
    }
  });
}
$(document).ready(function () {
  $('#countrySelect').change(function() {
    var selectedCountry = $(this).val();
    if (selectedCountry) {
      loadCountryBorder(selectedCountry);
      if ($('#Airports').is(':checked')) {
        loadAirports(selectedCountry);
      }
    }
  });

  map = L.map("map", {
    layers: [streets]
  }).setView([54.5, -4], 6);
  
  layerControl = L.control.layers(basemaps).addTo(map);

  infoBtn.addTo(map);
  $(document).ready(function() {
    // Make AJAX request to get countries
    $('input[type="checkbox"][id="Airports"]').change(function() {
      var isChecked = $(this).is(':checked');
      var selectedCountry = $('#countrySelect').val();
      
      if (isChecked && selectedCountry) {
        // Load airports for selected country
        loadAirports(selectedCountry);
      } else if (!isChecked && window.airportMarkers) {
        // Remove airports from map
        map.removeLayer(window.airportMarkers);
      }
    });
    
    $.ajax({
        url: 'libs/php/countrySelect.php',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            // Clear existing options
            $('#countrySelect').empty();
            
            // Add a default option (optional)
            $('#countrySelect').append('<option value="">Select a country</option>');
            
            // Add country options
            $.each(data, function(index, country) {
                $('#countrySelect').append(
                    $('<option></option>')
                        .val(country.code)
                        .text(country.name)
                );
            });
        },
        error: function(xhr, status, error) {
            console.error('Error loading countries:', error);
        }
    });
  });
  function countryInfo() {
    $("#loadingOverlay").show();
    makeAjaxRequest("countryInfo", function(result) {
      $("#loadingOverlay").hide();
      const locationData = result.data.results[0];
      $("#countryInfoName").text($("#countrySelect option:selected").text());
      $('#modalFlag').attr('src', `https://flagcdn.com/w640/${locationData.components.country_code}.png`);
      $('#modalLocation').text(locationData.formatted);
      $('#modalContinent').text(locationData.components.continent);
      $('#modalCurrency').text(`${locationData.annotations.currency.symbol} ${locationData.annotations.currency.iso_code}`);
      $('#timezone-name').text(locationData.annotations.timezone.name);
      $('#timezone-abbr').text(`${locationData.annotations.timezone.short_name}: ${locationData.annotations.timezone.offset_string}`);
      $('#modalDriveSide').text(locationData.annotations.roadinfo?.drive_on || 'N/A');
      $('#modalSpeedUnits').text(locationData.annotations.roadinfo?.speed_in || 'N/A');
      new bootstrap.Modal($('#dataModal')).show();
    });
  }
  
  function newsInfo() {
    $("#loadingOverlay").show();
    makeAjaxRequest("newsInfo", function(result) {
      $("#loadingOverlay").hide();
      $("#newsCountry").text($("#countrySelect option:selected").text());
      const articles = result.data.articles;
      articles.forEach(article => {
        $('#newsModal .modal-body').append(`
          <div class="card mb-3">
            <img src="${article.imageUrl}" class="card-img-top" alt="${article.title}">
            <div class="card-body">
              <p class="card-text">${article.summary}</p>
              <a href="${article.url}" class="btn btn-primary d-flex justify-content-center">Read More</a>
            </div>
          </div>
        `);
      });
      new bootstrap.Modal($('#newsModal')).show();
    });
  }

  function currencyConverter() {
    $("#loadingOverlay").show();
    makeAjaxRequest("convertInfo", function(result) {
      $("#loadingOverlay").hide();
      const currencyName = Object.keys(result.data.rates)[0];
      $('.currencyName').text(currencyName);
      new bootstrap.Modal($('#currencyModal')).show();
      $("#convertButton").click(() => {
        const amount = parseFloat($("#floatingTextarea").val()) || 1;
        let convertedValue;
        if ($("#selectedCurrency").val() === "USD") {
          // USD to foreign currency
          convertedValue = amount * result.data.rates[currencyName];
          $("#exchangeResult").text(`${amount} USD = ${convertedValue.toFixed(2)} ${currencyName}`);
        } else {
          // Foreign currency to USD
          convertedValue = amount / result.data.rates[currencyName];
          $("#exchangeResult").text(`${amount} ${currencyName} = ${convertedValue.toFixed(2)} USD`);
        }
        $("#floatingTextareaDisabled").val(convertedValue.toFixed(2));
      });
    });
  }
  
  function historyData() {
    $("#loadingOverlay").show();
    makeAjaxRequest("historyInfo", function(result) {
      $("#loadingOverlay").hide();
      const historyData = result.data;
      $("#historyModal .modal-body").html(historyData);
      $("#historyCountry").text($("#countrySelect option:selected").text());
      const historyEvents = result.data;
      historyEvents.forEach(history => {
        $('#historyModal .modal-body').append(`
          <div class="card my-3">
            <div class="card-header">
              Historical date: ${history.day}-${history.month}-${history.year}
            </div>
            <div class="card-body">
              <blockquote class="blockquote mb-0">
                <p>${history.event}</p>
              </blockquote>
            </div>
          </div>
        `);
      });
      new bootstrap.Modal($('#historyModal')).show();
    });
  }

  function weatherData() {
    $("#loadingOverlay").show();
    makeAjaxRequest("weatherInfo", function(result) {
      $("#loadingOverlay").hide();
      const weatherData = result.data;
      $("#locationName").text(weatherData.location.name + ", " + weatherData.location.country);
      $("#cityRegion").text(weatherData.location.region);
      
      const currentWeatherData = weatherData.current;
      $('.locationWeatherIcon').attr('src', currentWeatherData.condition.icon);
      $('#currentWeatherCondition').text(currentWeatherData.condition.text);
      $('#humidity').text(currentWeatherData.humidity + '%');
      $('#windSpeed').text(currentWeatherData.wind_kph + ' km/h');
      $('#visibility').text(currentWeatherData.vis_km + ' km');
      $('#currentTemp').text(currentWeatherData.temp_c + '°');
      $('#feelsLike').text(currentWeatherData.feelslike_c + '°C');

      const forecastData = weatherData.forecast.forecastday;
      $('#sunrise').text(forecastData[0].astro.sunrise);
      $('#sunset').text(forecastData[0].astro.sunset);
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      $('#forecastDays').html('');
      forecastData.forEach(forecast => {
        let date = new Date(forecast.date);
        let day = days[ date.getDay() ];
        $('#weatherModal #forecastDays').append(`
          <div class="col-md-12 my-4 bg-secondary">
            <div class="p-3">
              <div class="mx-auto d-flex align-items-center justify-content-center mb-3 shadow bg-light rounded m-3">
                  <div class="fw-bold text-primary h3 mb-2">${day}</div>
                  <img src=${forecast.day.condition.icon} 
                        alt="Weather Icon" 
                        class="mb-2 mx-3 forecast-icon">
                  <h1 class="display-3 fw-bold mb-0" id="avgTemp">${forecast.day.avgtemp_c}°</h1>
              </div>
              <div class="d-flex justify-content-around shadow bg-light rounded m-3 py-3">
                  <div class="text-center">
                      <i class="fas fa-tint text-primary fs-4"></i>
                      <div class="small text-muted">Humidity</div>
                      <div id="avgHumidity" class="fw-bold">${forecast.day.avghumidity}%</div>
                  </div>
                  <div class="text-center">
                      <i class="fas fa-wind text-primary fs-4"></i>
                      <div class="small text-muted">Wind</div>
                      <div id="avgWindSpeed" class="fw-bold">${forecast.day.maxwind_kph} km/h</div>
                  </div>
                  <div class="text-center">
                      <i class="fas fa-eye text-primary fs-4"></i>
                      <div class="small text-muted">Visibility</div>
                      <div id="avgVisibility" class="fw-bold">${forecast.day.avgvis_km} km</div>
                  </div>
              </div>
            </div>
          </div>
        `);
      });
      new bootstrap.Modal($('#weatherModal')).show();
    });
  }

  const buttonConfig = [
    {
      name: 'country-summary',
      icon: 'fa-earth-asia',
      title: 'Country Information',
      handler: () => countryInfo()
    },
    {
      name: 'weather',
      icon: 'fa-cloud-sun',
      title: 'Weather Data',
      handler: () => weatherData()
    },
    {
      name: 'news',
      icon: 'fa-newspaper',
      title: 'Latest News',
      handler: () => newsInfo()
    },
    {
      name: 'currency',
      icon: 'fa-coins',
      title: 'Currency Converter',
      handler: () => currencyConverter()
    },
    {
      name: 'history',
      icon: 'fa-wikipedia-w',
      title: 'Wikipedia Info',
      handler: () => historyData()
    },
    
  ];

  // Create buttons and add to map
  buttonConfig.forEach((btn, index) => {
    L.easyButton({
      position: 'topleft',
      leafletClasses: true,
      states: [{
        stateName: btn.name,
        icon: `<i class="fa-solid ${btn.icon}"></i>`,
        title: btn.title,
        onClick: btn.handler
      }]
    }).addTo(map);
  });
})


