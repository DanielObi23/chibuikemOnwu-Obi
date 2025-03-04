<?php
  // Set appropriate headers
  header('Content-Type: application/json; charset=UTF-8');
  
  // Get API key from environment variable or config file
  // Method 1: From environment variable
  $apiKey = "71f3907159804fceae2395c7687a5c06";  
  
  // Method 2: From config file (outside web root)
  // include('../../config/keys.php'); // $apiKey defined in keys.php
  
  // Get coordinates from POST request
  $lat = $_POST['lat'];
  $lng = $_POST['lng'];
  
  // Initialize cURL session
  $ch = curl_init(sprintf('https://api.opencagedata.com/geocode/v1/json?q=%s+%s&key=%s', $lat, $lng, $apiKey));
  
  // Set cURL options
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  
  // Execute cURL session
  $result = curl_exec($ch);
  
  // Close cURL session
  curl_close($ch);
  
  // Return response
  echo $result;
?>