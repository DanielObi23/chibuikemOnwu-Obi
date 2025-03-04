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

function countryCodeNeeded(requestName) {
  switch (requestName) {
    case "getAirports":
    case "getCities":
    case "getHistoricalSites":
    case "getMuseums":
    case "getMonuments":
    case "getBeaches":
      return true;
    default:
      return false;
  }

}

function makeAjaxRequest(name, successCallback) {
  $.ajax({
    url: "libs/php/app.php",
    type: 'POST',
    dataType: 'json',
    data: {   
      name: name, 
      country: countryCodeNeeded(name)? $("#countrySelect option:selected").val() : formatToHeaderSyntax($("#countrySelect option:selected").text())
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

var infoBtn = L.easyButton({
    position: 'topright',
    states: [{
      stateName: 'show-info',
      icon: '<i class="fas fa-info-circle"></i>',
      title: 'Show Country Information',
      onClick: function(control) {
        $("#loadingOverlay").show();
        
        makeAjaxRequest("countryDetails", function(result) {
            $("#loadingOverlay").hide();
            const countryData = result.data[0];
            const table = $('#dataTable');
            table.empty();
            
            const countryDataKeys = Object.keys(countryData);
            countryDataKeys.forEach((key, index) => {
                const row = $('<tr>');
                if (index % 2 === 0) {
                    row.addClass('bg-light');
                }
                
                const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                
                const keyCell = $('<td>')
                    .addClass('py-3 ps-4 text-secondary fw-bold')
                    .html(`<i class="fas fa-angle-right me-2 text-success"></i>${formattedKey}`);
 
                const valueCell = $('<td>')
                    .addClass('py-3 pe-4 text-end fw-bold text-dark');
                
                if (key === "currency" && countryData[key]) {
                    valueCell.html(`${countryData[key].name} <span class="badge bg-success ms-2">${countryData[key].code}</span>`);
                } else {
                    const value = countryData[key] ? countryData[key] : "N/A";
                    valueCell.text(value);
                    if (value === "N/A") {
                        valueCell.addClass('text-muted fst-italic');
                    }
                }
 
                row.append(keyCell, valueCell);
                table.append(row);
            });
            new bootstrap.Modal($('#countryDetailsModal')).show();
        });
      }
    }]
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
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // Hide loading overlay
      $("#loadingOverlay").hide();      
      console.log("Error with border data: " + textStatus);
    }
  });
}

// function loadMarkers(name, locationMarker, locationId, colour, icon) {
//     $("#loadingOverlay").show();
//     console.log("before makeAjax request")
//     makeAjaxRequest(name, function(result) {
//         $("#loadingOverlay").hide();
//         console.log("after makeAjax request, location marker")
//         if (!locationMarker) {
//           locationMarker = L.markerClusterGroup();
//         } else {
//           locationMarker.clearLayers();
//         }
//         console.log("after makeAjax request, location icon")
//         var locationIcon = L.ExtraMarkers.icon({
//           icon: icon,
//           markerColor: colour,
//           shape: 'square',
//           prefix: 'fa'
//         });
//         console.log("after makeAjax request, ternary")
//         name === 'getCities'? console.log("I've gotten the cities") : console.log("no cities found")
//         console.log("ternary operator passed")
//         result.data.geonames.forEach(function(location) {
//           var marker = L.marker([location.lat, location.lng], {
//             icon: locationIcon
//           });
          
//           var popupContent = `
//             <div class=${locationId}-popup>
//               <h4>${location.name}${name === 'getCities'? ', ' + location.adminName1 : ''}</h4>
//             </div>
//           `;
          
//           marker.bindPopup(popupContent);
//           locationMarker.addLayer(marker);
//         });
        
//         map.addLayer(locationMarker);
//       })
//   }

function getUserLocation() {
    if (navigator.geolocation) {
      $("#loadingOverlay").show();
      navigator.geolocation.getCurrentPosition(
        function(position) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          $.ajax({
            url: "libs/php/app.php",
            type: 'POST',
            dataType: 'json',
            data: {
              name: "reverseGeocode",
              lat: lat,
              lng: lng
            },
            success: function(result) {
              $("#loadingOverlay").hide();
              if (result.data && result.data.results && result.data.results.length > 0) {
                const countryCode = result.data.results[0].components.country_code.toUpperCase();

                if ($("#countrySelect option[value='" + countryCode + "']").length) {
                  $("#countrySelect").val(countryCode).trigger('change');
                }
              }
            },
            error: function(jqXHR, textStatus, errorThrown) {
              $("#loadingOverlay").hide();
              console.log("Error getting location data: " + textStatus);
            }
          });
        },
        function(error) {
          $("#loadingOverlay").hide();
          console.log("Error getting location:", error.message);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");}
  }
  
  function reverseGeocodeFrontend(lat, lng, callback) {
    $.ajax({
      url: "libs/php/reverseGeocode.php",
      type: 'POST',
      dataType: 'json',
      data: {
        lat: lat,
        lng: lng
      },
      success: function(result) {
        callback(result);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("Error with reverse geocoding: " + textStatus);
        callback(null);
      }
    });
  }
  
$(document).ready(function () {
    window.airportMarkers = L.markerClusterGroup();
    window.cityMarkers = L.markerClusterGroup();
    window.museumMarkers = L.markerClusterGroup();
    window.monumentMarkers = L.markerClusterGroup();
    window.historicalSiteMarkers = L.markerClusterGroup();

    // check to see if the checkbox is checked, if yes, shows the marker cluster
    var overlays = {
        "Airports": airportMarkers,
        "Cities": cityMarkers,
        "Museums": museumMarkers,
        "Monuments": monumentMarkers,
        "Historical Sites": historicalSiteMarkers
    };
    
    var layerConfigs = {
        "Airports": { endpoint: "getAirports", color: "blue", icon: "fa-plane" },
        "Cities": { endpoint: "getCities", color: "purple", icon: "fa-city" },
        "Museums": { endpoint: "getMuseums", color: "orange", icon: "fa-museum" },
        "Monuments": { endpoint: "getMonuments", color: "green", icon: "fa-monument" },
        "Historical Sites": { endpoint: "getHistoricalSites", color: "brown", icon: "fa-landmark" }
    };
    
    map = L.map("map", { layers: [streets] }).setView([54.5, -4], 6);
    var layerControl = L.control.layers(basemaps, overlays).addTo(map);

    $('#countrySelect').change(function() {
        var selectedCountry = $(this).val();
        if (selectedCountry) {
            loadCountryBorder(selectedCountry);
            // Load data for active overlays
            Object.keys(overlays).forEach(layerName => {
                if (map.hasLayer(overlays[layerName])) {
                    loadLayerData(layerName, selectedCountry);
                }
            });
        }
    });

    map.on('overlayadd', function(e) {
        const layerName = findLayerName(e.layer);
        const selectedCountry = $('#countrySelect').val();
        if (selectedCountry && layerName) loadLayerData(layerName, selectedCountry);
    });

    function findLayerName(layer) {
        return Object.keys(overlays).find(name => overlays[name] === layer);
    }

    function loadLayerData(layerName, countryCode) {
        const config = layerConfigs[layerName];
        const markerGroup = overlays[layerName];
        markerGroup.clearLayers();

        $("#loadingOverlay").show();
        makeAjaxRequest(config.endpoint, (result) => {
            $("#loadingOverlay").hide();
            const icon = L.ExtraMarkers.icon({
                icon: config.icon,
                markerColor: config.color,
                shape: 'square',
                prefix: 'fa'
            });
            result.data.geonames.forEach(location => {
                L.marker([location.lat, location.lng], { icon })
                    .bindPopup(`<h4>${location.name}${config.endpoint === 'getCities'? ', ' + location.adminName1 : ''}</h4>`)
                    .addTo(markerGroup);
            });
        });
    }

  infoBtn.addTo(map);
  $(document).ready(function() {
    $.ajax({
        url: 'libs/php/countrySelect.php',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          $.each(data, function(index, country) {
            $('#countrySelect').append(
              $('<option></option>')
                .val(country.code)
                .text(country.name)
            );
          });

          getUserLocation();
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
      
      // Set modal content
      $("#countryInfoName").text($("#countrySelect option:selected").text());
      $('#modalFlag').attr('src', `https://flagcdn.com/w640/${locationData.components.country_code.toLowerCase()}.png`);
      $('#modalLocation').text(locationData.formatted + " overview");
      $('#modalContinent').find('span').text(locationData.components.continent);
      $('#modalCurrency').text(`${locationData.annotations.currency.symbol} ${locationData.annotations.currency.iso_code}`);
      $('#timezone-name').text(locationData.annotations.timezone.name);
      $('#timezone-abbr').text(`${locationData.annotations.timezone.short_name}: ${locationData.annotations.timezone.offset_string}`);
      $('#modalDriveSide').text(locationData.annotations.roadinfo?.drive_on || 'N/A');
      $('#modalSpeedUnits').text(locationData.annotations.roadinfo?.speed_in || 'N/A');
      
      // Add animated entrance
      $('.modal-content').addClass('animate__animated animate__fadeInUp');
      
      // Show modal
      new bootstrap.Modal($('#dataModal')).show();
    });
  }
  
  function newsInfo() {
    $("#loadingOverlay").show();
    makeAjaxRequest("newsInfo", function(result) {
      $("#loadingOverlay").hide();
      $('#newsModal .modal-body').empty();
      
      const articles = result.data.articles;
      
      articles.forEach(article => {
        $('#newsModal .modal-body').append(`
          <div class="card mb-4 shadow-sm">
            <div class="position-relative">
              <img src="${article.imageUrl}" class="card-img-top" alt="${article.title}" 
                   onerror="this.src='images/news-placeholder.jpg'">
              <div class="position-absolute bottom-0 start-0 bg-dark bg-opacity-75 text-white px-3 py-2 w-100">
                <h5 class="card-title mb-0">${article.title}</h5>
              </div>
            </div>
            <div class="card-body">
              <p class="card-text text-muted small">${new Date(article.pubDate).toLocaleDateString()}</p>
              <p class="card-text">${article.summary}</p>
              <div class="d-flex justify-content-between align-items-center mt-3">
              <span class="badge bg-secondary">${article.source.domain || 'News'}</span>
                <a href="${article.url}" class="btn btn-outline-primary" target="_blank">
                  Read More <i class="fa-solid fa-arrow-right ms-1"></i>
                </a>
              </div>
            </div>
          </div>
        `);
      });
      
      // If no articles were found
      if (articles.length === 0) {
        $('#newsModal .modal-body').append(`
          <div class="text-center py-5">
            <i class="fa-solid fa-newspaper fa-3x text-muted mb-3"></i>
            <p>No news articles available at the moment.</p>
          </div>
        `);
      }
      
      new bootstrap.Modal($('#newsModal')).show();
    });
  }

  function currencyConverter() {
    $("#loadingOverlay").show();
    
    makeAjaxRequest("convertInfo", function(result) {
      $("#loadingOverlay").hide();
      const currencyName = Object.keys(result.data.rates)[0];
      
      $('.currencyName').text(currencyName);
      
      const modal = new bootstrap.Modal($('#currencyModal'));
      modal.show();

      setupConverter(result.data.rates[currencyName], currencyName);
    });
  }
  
  function setupConverter(exchangeRate, currencyName) {
    const $convertButton = $("#convertButton");
    const $amountInput = $("#amountInput");
    const $resultOutput = $("#resultOutput");
    const $selectedCurrency = $("#selectedCurrency");
    const $exchangeResult = $("#exchangeResult");
    
    const performConversion = () => {
      const amount = parseFloat($amountInput.val()) || 1;
      let convertedValue;
      const isUsdToForeign = $selectedCurrency.val() === "USD";

      if (isUsdToForeign) {
        convertedValue = amount * exchangeRate;
        $exchangeResult.text(`${amount.toFixed(2)} USD = ${convertedValue.toFixed(2)} ${currencyName}`);
      } else {
        convertedValue = amount / exchangeRate;
        $exchangeResult.text(`${amount.toFixed(2)} ${currencyName} = ${convertedValue.toFixed(2)} USD`);
      }
      $resultOutput.val(convertedValue.toFixed(2)).addClass('highlight');
      setTimeout(() => $resultOutput.removeClass('highlight'), 300);
    };
   
    $convertButton.on("click", performConversion);
    $amountInput.on("keyup", function(e) {
      if (e.key === "Enter") performConversion();
    });
    $selectedCurrency.on("change", performConversion);
    performConversion(); // does conversion of 1 to 1.
  }
  
  function historyData() {
    $("#loadingOverlay").show();
    makeAjaxRequest("historyInfo", function(result) {
      $("#loadingOverlay").hide();
      
      const countryName = $("#countrySelect option:selected").text();
      $('#historyContent').empty();
      
      const historyEvents = result.data;
      if (!historyEvents || historyEvents.length === 0) {
        $('#historyContent').html(`
          <div class="alert alert-info" role="alert">
            <i class="bi bi-info-circle me-2"></i>
            No historical events found for ${countryName}.
          </div>
        `);
      } else {
        historyEvents.sort((a, b) => {
          return new Date(b.year, b.month - 1, b.day) - new Date(a.year, a.month - 1, a.day);
        });
        
        historyEvents.forEach((history, index) => {
          const eventDate = new Date(history.year, history.month - 1, history.day);
          const formattedDate = eventDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
          
          $('#historyContent').append(`
            <div class="card my-3 shadow-sm" data-aos="fade-up" data-aos-delay="${index * 100}">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>
                  <i class="bi bi-calendar-event me-2"></i>
                  ${formattedDate}
                </span>
              </div>
              <div class="card-body">
                <blockquote class="blockquote mb-0">
                  <p>${history.event}</p>
                  ${history.description ? `<footer class="blockquote-footer mt-2">${history.description}</footer>` : ''}
                </blockquote>
              </div>
            </div>
          `);
        });
      }
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
          <!-- Weather Card Template -->
            <div class="col-md-12 my-3" id="weather-card">
            <div class="card border-0 shadow-sm hover-shadow">
                <div class="card-body p-0">
                <div class="row g-0">
                    <!-- Day Header with Gradient -->
                    <div class="col-12 bg-gradient-primary text-white p-3 rounded-top d-flex justify-content-between align-items-center">
                    <h5 class="mb-0 fw-bold">${day}</h5>
                    <span class="badge bg-light text-primary">${forecast.date}</span>
                    </div>
                    
                    <!-- Weather Content -->
                    <div class="col-md-4 text-center p-3 d-flex flex-column justify-content-center align-items-center border-end">
                    <img src="${forecast.day.condition.icon}" 
                        alt="Weather Icon" 
                        class="weather-icon mb-2" 
                        style="width: 64px; height: 64px;">
                    <h4 class="text-primary mb-1">${forecast.day.avgtemp_c}°C</h4>
                    <p class="mb-0 text-muted small">${forecast.day.condition.text}</p>
                    </div>
                    
                    <!-- Weather Details -->
                    <div class="col-md-8">
                    <div class="p-3">
                        <div class="row g-3">
                        <!-- Temperature Range -->
                        <div class="col-6 col-md-6">
                            <div class="d-flex align-items-center">
                            <div class="icon-box bg-light-primary rounded-circle p-2 me-2">
                                <i class="fas fa-temperature-high text-primary"></i>
                            </div>
                            <div>
                                <div class="small text-muted">Temperature</div>
                                <div class="fw-bold">${forecast.day.mintemp_c}° - ${forecast.day.maxtemp_c}°</div>
                            </div>
                            </div>
                        </div>
                        
                        <!-- Humidity -->
                        <div class="col-6 col-md-6">
                            <div class="d-flex align-items-center">
                            <div class="icon-box bg-light-primary rounded-circle p-2 me-2">
                                <i class="fas fa-tint text-primary"></i>
                            </div>
                            <div>
                                <div class="small text-muted">Humidity</div>
                                <div class="fw-bold">${forecast.day.avghumidity}%</div>
                            </div>
                            </div>
                        </div>
                        
                        <!-- Wind Speed -->
                        <div class="col-6 col-md-6">
                            <div class="d-flex align-items-center">
                            <div class="icon-box bg-light-primary rounded-circle p-2 me-2">
                                <i class="fas fa-wind text-primary"></i>
                            </div>
                            <div>
                                <div class="small text-muted">Wind</div>
                                <div class="fw-bold">${forecast.day.maxwind_kph} km/h</div>
                            </div>
                            </div>
                        </div>
                        
                        <!-- Visibility -->
                        <div class="col-6 col-md-6">
                            <div class="d-flex align-items-center">
                            <div class="icon-box bg-light-primary rounded-circle p-2 me-2">
                                <i class="fas fa-eye text-primary"></i>
                            </div>
                            <div>
                                <div class="small text-muted">Visibility</div>
                                <div class="fw-bold">${forecast.day.avgvis_km} km</div>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
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


