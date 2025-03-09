$("#cover").css("visibility", "hidden"); // hides body until after getUserLocation is called
$("#loadingOverlay").show();
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
  
function loadCountryBorder(countryCode) {
  // Clear any existing borders
  if (window.borderLayer) {
    map.removeLayer(window.borderLayer);
  }
  
  $.ajax({
    url: 'libs/php/countryBorder.php',
    type: 'POST',
    dataType: 'json',
    data: {
      country: countryCode
    },
    success: function(result) {
      $("#loadingOverlay").hide();
        var borderStyle = {
            color: "#CC0000",
            weight: 3,
            opacity: 0.8,
            fillColor: "#FFFFFF",
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
      console.log("Error with border data: " + textStatus);
    }
  });
}

function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          $.ajax({
            url: "libs/php/reverseGeocode.php",
            type: 'POST',
            dataType: 'json',
            data: {
              lat: lat,
              lng: lng
            },
            success: function(result) {
              if (result.data && result.data.results && result.data.results.length > 0) {
                const countryCode = result.data.results[0].components.country_code.toUpperCase();
                
                if ($("#countrySelect option[value='" + countryCode + "']").length) {
                  $("#countrySelect").val(countryCode).trigger('change');
                }
              }
            },
            error: function(jqXHR, textStatus, errorThrown) {
              console.log("Error getting location data: " + textStatus);
            }
          });
        },
        function(error) {
          console.log("Error getting location:", error.message);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
    setTimeout(() => {
      $("#cover").css("visibility", "visible");
      $("#loadingOverlay").hide()
    }, 800);
  }

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
  
$(function () {
  window.airportMarkers = L.markerClusterGroup({
    polygonOptions: {
      color: "rgb(0, 0, 255)",           
      fillColor: "rgba(0, 0, 255, 0.2)", 
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }
  });
  
  window.cityMarkers = L.markerClusterGroup({
    polygonOptions: {
      color: "rgb(128, 0, 128)",           
      fillColor: "rgba(128, 0, 128, 0.2)", 
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }
  });
  
  window.museumMarkers = L.markerClusterGroup({
    polygonOptions: {
      color: "rgb(255, 165, 0)",           
      fillColor: "rgba(255, 165, 0, 0.2)",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }
  });
  
  window.monumentMarkers = L.markerClusterGroup({
    polygonOptions: {
      color: "rgb(0, 128, 0)",           
      fillColor: "rgba(0, 128, 0, 0.2)", 
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }
  });
  
  window.historicalSiteMarkers = L.markerClusterGroup({
    polygonOptions: {
      color: "rgb(165, 42, 42)",           
      fillColor: "rgba(165, 42, 42, 0.2)", 
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }
  });

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
  function countryCodeNeeded(requestName) {
    switch (requestName) {
      case "getAirports":
      case "getCities":
      case "getHistoricalSites":
      case "getMuseums":
      case "getMonuments":
        return true;
      default:
        return false;
    }
  
  }
  function makeAjaxRequest(name, successCallback) {
    urlName = name.substring(0, 3) === "get" ? "markerCluster" : name; // i needed markercluster as the name for when the marker cluster is called by loadlayerdata()
    map.spin(true)
    $.ajax({
      url: `libs/php/${urlName}.php`,
      type: 'POST',
      dataType: 'json',
      data: {   
        name: name, 
        country: countryCodeNeeded(name)? $("#countrySelect option:selected").val() : formatToHeaderSyntax($("#countrySelect option:selected").text())
      },
      success: function(result) {
        map.spin(false)
        successCallback(result);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("Error with data: " + textStatus);
        console.log("Response text:", jqXHR.responseText);
        console.log("Status:", jqXHR.status);
        console.log("Error thrown:", errorThrown);
      }
    })
  }
  function countryDetails(){ 
    $("#loadingOverlay").show();
    
    makeAjaxRequest("countryDetails", function(result) {
        $("#loadingOverlay").hide();
        const countryData = result.data;
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
            
            const value = countryData[key] ? countryData[key] : "N/A";
            valueCell.text(value);
            if (value === "N/A") {
                valueCell.addClass('text-muted fst-italic');
            }
            row.append(keyCell, valueCell);
            table.append(row);
        });
        new bootstrap.Modal($('#countryDetailsModal')).show();
    });}

  var infoBtn = L.easyButton({
    position: 'topright',
    states: [{
      stateName: 'show-info',
      icon: '<i class="fas fa-info-circle"></i>',
      title: 'Show Country Information',
      onClick: () => countryDetails()
      }]
  });

  $('#countrySelect').on("change", function() {
      var selectedCountry = $(this).val();
      if (selectedCountry) {
          loadCountryBorder(selectedCountry);
          // Load data for active overlays
          Object.keys(overlays).forEach(layerName => {
              if (map.hasLayer(overlays[layerName])) {
                  loadLayerData(layerName, selectedCountry);
                }
              });
              countryDetails();
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
      makeAjaxRequest(config.endpoint, (result) => {
          const icon = L.ExtraMarkers.icon({
              icon: config.icon,
              markerColor: config.color,
              shape: 'square',
              prefix: 'fa'
          });
          result.data.forEach(location => {
              L.marker([location.lat, location.lng], { icon })
                  .bindPopup(`<h4>${location.name}${config.endpoint === 'getCities'? ', ' + location.adminName1 : ''}</h4>`)
                  .addTo(markerGroup);
          });
      });
  }


  infoBtn.addTo(map);

  function countryInfo() {    
    makeAjaxRequest("countryInfo", function(result) {
      const info = result.data;
      $("#countryInfoName").text($("#countrySelect option:selected").text());
      $('#modalFlag').attr('src', info.flag);
      $('#modalLocation').text(info.location);
      $('#modalContinent').find('span').text(info.continent);
      $('#modalCurrency').text(info.currency);
      $('#timezone-name').text(info.timezone_name);
      $('#timezone-abbr').text(info.timezone_abbr);
      $('#modalDriveSide').text(info.drive_side);
      $('#modalSpeedUnits').text(info.speed_units);

      new bootstrap.Modal($('#dataModal')).show();
    });
  }
  
  function newsInfo() {
    makeAjaxRequest("newsInfo", function(result) {
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
              <span class="badge bg-secondary">${article.sourceName}</span>
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
    makeAjaxRequest("convertInfo", function(result) {
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

    $amountInput.on("keyup", performConversion);
    $selectedCurrency.on("change", performConversion);
    performConversion(); // does conversion of 1 to 1.
  }
  
  function historyData() {
    makeAjaxRequest("historyInfo", function(result) {      
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
    makeAjaxRequest("weatherInfo", function(result) {
      const weatherData = result.data;
      $("#locationName").text(weatherData.location);
      $("#cityRegion").text(weatherData.region);
      $('.locationWeatherIcon').attr('src', weatherData.icon);
      $('#currentWeatherCondition').text(weatherData.text);
      $('#maxTemp').text(weatherData.maxTemp);
      $('#minTemp').text(weatherData.minTemp);

      $('#forecastDays').html('');
      weatherData.forecast.forEach(forecast => {
        let date = new Date(forecast.date);
        let day = date.toString().split(' ');
        $('#weatherModal #forecastDays').append(`
            <div class="border-0 shadow-sm hover-shadow mb-3 col-md-4 bg-light text-center d-flex flex-column justify-content-center align-items-center py-3">
              <span class="badge bg-light text-primary">${day[0]} ${day[2]}</span>
              <img src="${forecast.conditionIcon}" 
                  alt="Weather Icon" 
                  class="weather-icon mb-2" 
                  style="width: 64px; height: 64px;">
              <div>
                  <div class="fw-bold">${Math.round(forecast.maxC)}° / ${Math.round(forecast.minC)}°</div>
              </div>
              <p class="mb-0 text-muted small">${forecast.conditionText}</p>
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


