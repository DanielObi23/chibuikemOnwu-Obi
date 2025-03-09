<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	header('Content-Type: application/json; charset=UTF-8');
  header('Access-Control-Allow-Origin: *');	

	$executionStartTime = microtime(true);

	$url = "https://api.opencagedata.com/geocode/v1/json?q=" . $_REQUEST["country"] . "&key=71f3907159804fceae2395c7687a5c06";

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
    $countryInfo = json_decode($result,true);

    if (json_last_error() !== JSON_ERROR_NONE) {

      $output['status']['code'] = json_last_error();
      $output['status']['name'] = "Failure - JSON";
      $output['status']['description'] = json_last_error_msg();
      $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
      $output['data'] = null;

    } else {

      if (isset($countryInfo['error'])) {

        $output['status']['code'] = $countryInfo['error']['code'];
        $output['status']['name'] = "Failure - API";
        $output['status']['description'] = $countryInfo['error']['message'];
  	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
	  	  $output['data'] = null;

      } else {
        $countryInfo = $countryInfo['results'][0];
        $annotations = $countryInfo['annotations'];
        $components = $countryInfo['components'];

        $finalResult['flag'] = "https://flagcdn.com/w640/". strtolower($components['country_code']) . ".png";
        $finalResult['location'] = $countryInfo['formatted'];
        $finalResult['continent'] = $components['continent'];
        $finalResult['currency'] = $annotations['currency']['symbol'] . " " . $annotations['currency']['iso_code'];
        $finalResult['timezone_name'] = $annotations['timezone']['name'];
        $finalResult['timezone_abbr'] = $annotations['timezone']['short_name'] . ": " . $annotations['timezone']['offset_string'];
        $finalResult['drive_side'] = $annotations['roadinfo']['drive_on'] ?? 'N/A';
        $finalResult['speed_units'] = $annotations['roadinfo']['speed_in'] ?? 'N/A';

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