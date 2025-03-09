<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');	

$executionStartTime = microtime(true);

switch ($_REQUEST['name']) {
    case 'getAirports':
        $url = "http://api.geonames.org/searchJSON?formatted=true&q=airport&country=" . $_REQUEST['country'] . "&username=flightltd&style=full";
        break;
    case 'getCities':
        $url = "http://api.geonames.org/searchJSON?country=" . $_POST['country'] . "&featureCode=ADM2&maxRows=1000&username=flightltd&style=full";
        break;
    case 'getHistoricalSites':
        $url = "http://api.geonames.org/searchJSON?formatted=true&q=historical%20site&country=" . $_POST['country']. "&username=flightltd&style=full";
        break;
    case 'getMuseums':
        $url = "http://api.geonames.org/searchJSON?formatted=true&q=museum&country=" . $_POST['country']. "&username=flightltd&style=full";
        break;
    case 'getMonuments':
        $url = "http://api.geonames.org/searchJSON?formatted=true&q=monument&country=". $_POST['country']. "&username=flightltd&style=full";
        break;
    case 'reverseGeocode':
        $lat = $_REQUEST['lat'];
        $lng = $_REQUEST['lng'];
        $url = "https://api.opencagedata.com/geocode/v1/json?q=" . $lat . "+" . $lng . "&key=71f3907159804fceae2395c7687a5c06";
        break;
}
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
    $clusters = json_decode($result,true);

    if (json_last_error() !== JSON_ERROR_NONE) {

      $output['status']['code'] = json_last_error();
      $output['status']['name'] = "Failure - JSON";
      $output['status']['description'] = json_last_error_msg();
      $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
      $output['data'] = null;

    } else {

      if (isset($clusters['error'])) {

        $output['status']['code'] = $clusters['error']['code'];
        $output['status']['name'] = "Failure - API";
        $output['status']['description'] = $clusters['error']['message'];
  	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
	  	$output['data'] = null;

      } else {
        $finalResult = [];
        foreach ($clusters['geonames'] as $item) {
            $temp = []; 
            $temp['lat'] = $item['lat'];
            $temp['lng'] = $item['lng'];
            $temp['name'] = $item['name'];
            $temp['adminName1'] = $item['adminName1'];
  
            array_push($finalResult, $temp);          
  
          }
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