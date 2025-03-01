<?php
  header('Content-Type: application/json; charset=UTF-8');

  $ch = curl_init();

  $url = 'https://api.api-ninjas.com/v1/airports?country=' . $_POST['country'];

  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'X-API-KEY: 524m335Z7c1q8mgGCYlOdOTolhLQEITMN1sV9kBQ'
  ));

  $result = curl_exec($ch);
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

  curl_close($ch);

  $output = array(
    'status' => array(
      'code' => $httpCode,
      'name' => 'ok'
    ),
    'data' => json_decode($result)
  );

  echo json_encode($output);
?>
