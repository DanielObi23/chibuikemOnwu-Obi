<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// Handle different API endpoints based on the 'name' parameter
$url = "http://api.geonames.org/";

switch($_REQUEST['name']) {
    case 'countryCode':
        $url .= "countryCodeJSON?lat=" . $_REQUEST['lat'] . "&lng=" . $_REQUEST["lng"] . "&username=daniel456";
        break;
    case 'countryInfo':
        $url .= "countryInfoJSON?country=" . $_REQUEST['country'] . "&username=daniel456";
        break;
    case 'findNearByWeatherJSON':
        $url .= "findNearByWeatherJSON?lat=" . $_REQUEST['lat'] . "&lng=" . $_REQUEST["lng"] . "&username=daniel456";
        break;
    default:
        // Handle invalid API request
        $output['status']['code'] = "400";
        $output['status']['name'] = "error";
        $output['status']['description'] = "Invalid API request";
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($output);
        exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>