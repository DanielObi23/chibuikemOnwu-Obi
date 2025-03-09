<?php
	ini_set('display_errors', 'On');
    error_reporting(E_ALL);

	header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');	

	$executionStartTime = microtime(true);

    $url = "https://api.api-ninjas.com/v1/country?name=" . $_REQUEST['country'] . "&X-Api-Key=524m335Z7c1q8mgGCYlOdOTolhLQEITMN1sV9kBQ";

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result = curl_exec($ch);

    $cURLERROR = curl_errno($ch);
  
    curl_close($ch);

	if ($cURLERROR) {

		$output['status']['code'] = $cURLERROR;
        $output['status']['name'] = "Failure - cURL";
        $output['status']['description'] = curl_strerror($cURLERROR);
		$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
		$output['data'] = null;

	} else {
    $countryDetails = json_decode($result,true);

    if (json_last_error() !== JSON_ERROR_NONE) {
      $output['status']['code'] = json_last_error();
      $output['status']['name'] = "Failure - JSON";
      $output['status']['description'] = json_last_error_msg();
      $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
      $output['data'] = null;

    } else {

      if (isset($countryDetails['error'])) {

        $output['status']['code'] = $countryDetails['error']['code'];
        $output['status']['name'] = "Failure - API";
        $output['status']['description'] = $countryDetails['error']['message'];
  	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
	  	$output['data'] = null;

      } else {
        $countryDetails = $countryDetails[0];
        $finalResult = [];
        $finalResult["Capital"] = $countryDetails['capital'];
        $finalResult["Region"] = $countryDetails['region'];
        $finalResult["Iso2"] = $countryDetails['iso2'];
        $finalResult["Currency"] = $countryDetails['currency']['name'] . " (" . $countryDetails['currency']['code'] . ")";
        $finalResult["GDP"] = number_format($countryDetails['gdp']) . " (USD)";
        $finalResult["GDP per capita"] = number_format($countryDetails['gdp_per_capita']) . " (USD)";
        $finalResult["Imports (million USD)"] = number_format($countryDetails['imports']); 
        $finalResult["Exports (million USD)"] = number_format($countryDetails['exports']);
        $finalResult["unemployment rate (%)"] = $countryDetails['unemployment'];
        $finalResult["Surface area (km²)"] = number_format($countryDetails['surface_area']);
        $finalResult["Population"] = number_format($countryDetails['population']).",000";
        $finalResult["Population growth rate (%)"] = $countryDetails['pop_growth'];
        $finalResult["Population density (people/km²)"] = number_format($countryDetails['pop_density']);
        $finalResult["Life expectancy (years)"] = "M: " . $countryDetails['life_expectancy_male'] . ", F: " . $countryDetails['life_expectancy_female'];
        $finalResult["Fertility rate (births per 1,000)"] = $countryDetails['fertility'];
        $finalResult['Infant mortality rate (deaths per 1,000)'] = $countryDetails['infant_mortality'];
        $finalResult["homicide rate (per 100,000)"] = $countryDetails['homicide_rate'];
        $finalResult["CO₂ emissions (Million metric tons)"] = $countryDetails['co2_emissions'];

        $output['status']['code'] = 200;
     	$output['status']['name'] = "success";
        $output['status']['description'] = "all ok";
  	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
	  	$output['data'] = $finalResult;
      }

    }

	}

	echo json_encode($output, JSON_NUMERIC_CHECK); 

?>