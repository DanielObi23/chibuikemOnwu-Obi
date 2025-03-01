<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

switch ($_REQUEST['name']) {
    case 'countryInfo':
        $url = "https://api.opencagedata.com/geocode/v1/json?q=" . $_REQUEST["country"] . "&key=71f3907159804fceae2395c7687a5c06";
        break;
    case 'newsInfo':
        $url = "https://api.goperigon.com/v1/all?from=2025-01-28&q=" . $_REQUEST["country"] . "&sourceGroup=top100&language=en&apiKey=96588d90-27f3-4cb7-b4cd-e2669c59ee8f";
        break;
    case 'convertInfo':
        // calling the opencagedata API to get the currency code for the openexchangerates API
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
        break;
    case 'historyInfo':
        $url = "https://api.api-ninjas.com/v1/historicalevents?text=" . $_REQUEST["country"] . "&X-Api-Key=524m335Z7c1q8mgGCYlOdOTolhLQEITMN1sV9kBQ";
        break;
    case 'weatherInfo':
        $url = "http://api.weatherapi.com/v1/forecast.json?key=e7c2568aee2a4c708e4184553252502&q=" . $_REQUEST["country"] . "&days=5&aqi=no&alerts=no";
        break;
    case 'countryDetails':
        $url = "https://api.api-ninjas.com/v1/country?name=" . $_REQUEST['country'] . "&X-Api-Key=524m335Z7c1q8mgGCYlOdOTolhLQEITMN1sV9kBQ";
        break;
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