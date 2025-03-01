<?php
// Set content type header
header('Content-Type: application/json');

// Get the country code from POST
$countryCode = isset($_POST['country']) ? $_POST['country'] : '';

// Check if country code is provided
if (!$countryCode) {
    echo json_encode([
        'status' => [
            'code' => 400,
            'message' => 'Country code is required'
        ],
        'data' => null
    ]);
    exit;
}

// Path to GeoJSON file
$geojsonFile = 'countryBorders.geo.json'; // Adjust path based on your folder structure

// Check if file exists
if (!file_exists($geojsonFile)) {
    echo json_encode([
        'status' => [
            'code' => 500,
            'message' => 'GeoJSON file not found'
        ],
        'data' => null
    ]);
    exit;
}

// Read the GeoJSON file
$geojsonData = file_get_contents($geojsonFile);

// Parse the JSON data
$data = json_decode($geojsonData, true);

// Check if parsing was successful
if ($data === null) {
    echo json_encode([
        'status' => [
            'code' => 500,
            'message' => 'Error parsing GeoJSON data: ' . json_last_error_msg()
        ],
        'data' => null
    ]);
    exit;
}

// Find the feature for the specified country code
$countryFeature = null;
foreach ($data['features'] as $feature) {
    if (isset($feature['properties']['iso_a2']) && $feature['properties']['iso_a2'] === $countryCode) {
        $countryFeature = $feature;
        break;
    }
}

// Check if country was found
if ($countryFeature === null) {
    echo json_encode([
        'status' => [
            'code' => 404,
            'message' => 'Country not found'
        ],
        'data' => null
    ]);
    exit;
}

// Return the feature as JSON
echo json_encode([
    'status' => [
        'code' => 200,
        'message' => 'OK'
    ],
    'data' => $countryFeature
]);
?>