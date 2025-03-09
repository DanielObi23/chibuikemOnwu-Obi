<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	header('Content-Type: application/json; charset=UTF-8');
  header('Access-Control-Allow-Origin: *');	

	$executionStartTime = microtime(true);

   
  $url = "https://api.api-ninjas.com/v1/historicalevents?text=" . $_REQUEST["country"] . "&X-Api-Key=524m335Z7c1q8mgGCYlOdOTolhLQEITMN1sV9kBQ";

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
    $historyInfo = json_decode($result,true);

    if (json_last_error() !== JSON_ERROR_NONE) {

      $output['status']['code'] = json_last_error();
      $output['status']['name'] = "Failure - JSON";
      $output['status']['description'] = json_last_error_msg();
      $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
      $output['data'] = null;

    } else {

      if (isset($historyInfo['error'])) {

        $output['status']['code'] = $historyInfo['error']['code'];
        $output['status']['name'] = "Failure - API";
        $output['status']['description'] = $historyInfo['error']['message'];
  	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
	  	  $output['data'] = null;

      } else {
        $output['status']['code'] = 200;
     	  $output['status']['name'] = "success";
        $output['status']['description'] = "all ok";
  	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
	  	  $output['data'] = $historyInfo;

      }

    }

	}

	echo json_encode($output, JSON_NUMERIC_CHECK); 

?>