<?php
  // Set appropriate headers
  header('Content-Type: application/json; charset=UTF-8');
  
  // Initialize cURL
  $ch = curl_init();
  
  // Set the API endpoint
  $url = 'https://api.api-ninjas.com/v1/airports?country=' . $_POST['country'];
  
  // Set cURL options
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'X-API-KEY: 524m335Z7c1q8mgGCYlOdOTolhLQEITMN1sV9kBQ'
  ));
  
  // Execute the request
  $result = curl_exec($ch);
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  
  // Close cURL resource
  curl_close($ch);
  
  // Prepare the response
  $output = array(
    'status' => array(
      'code' => $httpCode,
      'name' => 'ok'
    ),
    'data' => json_decode($result)
  );
  
  // Return the JSON response
  echo json_encode($output);
?>