<?php
  header('Content-Type: application/json; charset=UTF-8');
  $apiKey = "71f3907159804fceae2395c7687a5c06";  
  $lat = $_POST['lat'];
  $lng = $_POST['lng'];
  $ch = curl_init(sprintf('https://api.opencagedata.com/geocode/v1/json?q=%s+%s&key=%s', $lat, $lng, $apiKey));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $result = curl_exec($ch);
  curl_close($ch);
  echo $result;
?>
