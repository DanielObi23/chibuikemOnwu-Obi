<?php
header('Content-Type: application/json');

$geojsonFile = 'countryBorders.geo.json';
$geojsonData = file_get_contents($geojsonFile);

if ($geojsonData === false) {
    echo json_encode(['error' => 'Could not read GeoJSON file']);
    exit;
}

$data = json_decode($geojsonData, true);

if ($data === null) {
    echo json_encode(['error' => 'Error parsing GeoJSON data: ' . json_last_error_msg()]);
    exit;
}

$countries = [];
foreach ($data['features'] as $feature) {
    $isoCode = isset($feature['properties']['iso_a2']) ? $feature['properties']['iso_a2'] : '';
    $countryName = isset($feature['properties']['name']) ? $feature['properties']['name'] : '';

    if ($isoCode && $countryName) {
        $countries[] = [
            'code' => $isoCode,
            'name' => $countryName
        ];
    }
}

usort($countries, function($a, $b) {
    return strcmp($a['name'], $b['name']);
});

echo json_encode($countries);
?>