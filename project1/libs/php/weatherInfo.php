<?php
	ini_set('display_errors', 'On');
    error_reporting(E_ALL);

	header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');	

	$executionStartTime = microtime(true);

    if ($_REQUEST["country"] === "United+Kingdom") {
        $url = "http://api.weatherapi.com/v1/forecast.json?key=e7c2568aee2a4c708e4184553252502&q=london&days=6&aqi=no&alerts=no";
    } else {     
        $url = "http://api.weatherapi.com/v1/forecast.json?key=e7c2568aee2a4c708e4184553252502&q=" . $_REQUEST["country"] . "&days=6&aqi=no&alerts=no";
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
    $weatherInfo = json_decode($result,true);

    if (json_last_error() !== JSON_ERROR_NONE) {
      $output['status']['code'] = json_last_error();
      $output['status']['name'] = "Failure - JSON";
      $output['status']['description'] = json_last_error_msg();
      $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
      $output['data'] = null;

    } else {

      if (isset($weatherInfo['error'])) {

        $output['status']['code'] = $weatherInfo['error']['code'];
        $output['status']['name'] = "Failure - API";
        $output['status']['description'] = $weatherInfo['error']['message'];
  	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
	  	$output['data'] = null;

      } else {
        $finalResult = [];
        $finalResult['location'] = $weatherInfo['location']['name'] . ", " . $weatherInfo['location']['country'];
        $finalResult['region'] = $weatherInfo['location']['region'];
        $finalResult['icon'] = $weatherInfo['current']['condition']['icon'];
        $finalResult['text'] = $weatherInfo['current']['condition']['text'];
        $finalResult["maxTemp"] = round($weatherInfo['forecast']['forecastday'][0]['day']['maxtemp_c']) . "°";
        $finalResult["minTemp"] = round($weatherInfo['forecast']['forecastday'][0]['day']['mintemp_c']) . "°";
        $finalResult['forecast'] = [];

        foreach ($weatherInfo['forecast']['forecastday'] as $item) {
            $temp = []; 
            $temp['date'] = $item['date'];
  
            $temp['minC'] = intval($item['day']['mintemp_c']);
            $temp['maxC'] = intval($item['day']['maxtemp_c']);
  
            $temp['conditionText'] = $item['day']['condition']['text'];
            $temp['conditionIcon'] = 'https:' . $item['day']['condition']['icon'];
  
            array_push($finalResult['forecast'], $temp);          
  
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