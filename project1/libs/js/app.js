// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

var map;

// tile layers

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

// buttons

var infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
  $("#exampleModal").modal("show");
});

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// initialise and add controls once DOM is ready

$(document).ready(function () {
  
  map = L.map("map", {
    layers: [streets]
  }).setView([54.5, -4], 6);
  
  
  // setView is not required in your application as you will be
  // deploying map.fitBounds() on the country border polygon

  layerControl = L.control.layers(basemaps).addTo(map);

  infoBtn.addTo(map);

  $("input").on('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // prevent the form from submitting on any keydown event except for Enter

      // converting text to http header syntax
      function formatToHeaderSyntax(text) {
        const encoded = encodeURIComponent(text);
        return encoded.replace(/%20/g, '+');
      }

      const location = formatToHeaderSyntax($("#location").val());
      console.log(`country: ${location}`);

      $.ajax({
        url: "libs/php/app.php",
        type: 'POST',
        dataType: 'json',
        data: {     
          location: location,
        },
        success: function(result) {
          console.log("Result:", result);

          if (result.data && result.data.results && result.data.results.length > 0) {
          
            const locationData = result.data.results[0];
            $('#modalFlag').attr('src', `https://flagcdn.com/w640/${locationData.components.country_code}.png`);
            $('#modalLocation').text(locationData.components.city || locationData.components.town || locationData.components.village || 'N/A'); 
            $('#modalContinent').text(locationData.components.continent);
            $('#modalCurrency').text(`${locationData.annotations.currency.symbol} ${locationData.annotations.currency.iso_code}`);
            $('#timezone-name').text(locationData.annotations.timezone.name);
            $('#timezone-abbr').text(`${locationData.annotations.timezone.short_name}: ${locationData.annotations.timezone.offset_string}`);
            $('#modalDriveSide').text(locationData.annotations.roadinfo?.drive_on || 'N/A');
            $('#modalSpeedUnits').text(locationData.annotations.roadinfo?.speed_in || 'N/A');
            $('#modalFullAddress').text(locationData.formatted);
        
            // Show data modal
            new bootstrap.Modal($('#dataModal')).show();
            
            // Geometry 
            const lat = locationData.geometry.lat;
            const lng = locationData.geometry.lng;
        
            map.setView([lat, lng], 6);
            L.marker([lat, lng]).addTo(map);
          } else {
            console.log("No results found.");
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log("Error with data: " + textStatus);
        }
      });
    }
  });
})
