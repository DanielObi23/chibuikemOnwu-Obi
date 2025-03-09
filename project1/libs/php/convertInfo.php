<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	header('Content-Type: application/json; charset=UTF-8');
  header('Access-Control-Allow-Origin: *');	

	  $executionStartTime = microtime(true);

    $opencageUrl = "https://api.opencagedata.com/geocode/v1/json?q=" . urlencode($_REQUEST['country']) . "&key=71f3907159804fceae2395c7687a5c06";
        
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $opencageUrl);
    $opencageResult = curl_exec($ch);
    curl_close($ch);
    
    $opencageData = json_decode($opencageResult, true);
    
    if (empty($opencageData['results'][0]['annotations']['currency']['iso_code'])) {
        $output['status']['code'] = "404";
        $output['status']['name'] = "not found";
        $output['status']['description'] = "Currency ISO code not found for " . $country;
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($output);
        exit;
        }
    $currencyCode = $opencageData['results'][0]['annotations']['currency']['iso_code'];
    $url = "https://openexchangerates.org/api/latest.json?app_id=769e034052d84a7d963fedc571fccf48&base=USD&symbols=" . $currencyCode . "&prettyprint=true&show_alternative=false";

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
    $convertInfo = json_decode($result,true);

    if (json_last_error() !== JSON_ERROR_NONE) {

      $output['status']['code'] = json_last_error();
      $output['status']['name'] = "Failure - JSON";
      $output['status']['description'] = json_last_error_msg();
      $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
      $output['data'] = null;

    } else {

      if (isset($convertInfo['error'])) {

        $output['status']['code'] = $convertInfo['error']['code'];
        $output['status']['name'] = "Failure - API";
        $output['status']['description'] = $convertInfo['error']['message'];
  	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
	  	  $output['data'] = null;

      } else {
        $output['status']['code'] = 200;
     	  $output['status']['name'] = "success";
        $output['status']['description'] = "all ok";
  	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
	  	  $output['data'] = $convertInfo;
      }

    }

	}

	echo json_encode($output, JSON_NUMERIC_CHECK); 

?>