<?php

	// example use from browser
	// http://localhost/companydirectory/libs/php/getPersonnelByID.php?id=<id>

	// remove next two lines for production
	
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	include("config.php");

	header('Content-Type: application/json; charset=UTF-8');

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

	if (mysqli_connect_errno()) {
		
		$output['status']['code'] = "300";
		$output['status']['name'] = "failure";
		$output['status']['description'] = "database unavailable";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output);

		exit;

	}	

	// first query - SQL statement accepts parameters and so is prepared to avoid SQL injection.
	// $_REQUEST used for development / debugging. Remember to change to $_POST for production

    if ($_REQUEST["department"] && !$_REQUEST["location"]) {
		$query = $conn->prepare('SELECT 
					p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location 
				  FROM personnel p 
				  LEFT JOIN department d ON (d.id = p.departmentID) 
				  LEFT JOIN location l ON (l.id = d.locationID) 
				  WHERE departmentID = ? 
				  ORDER BY p.lastName, p.firstName, d.name, l.name');

		$query->bind_param("i", $_REQUEST['department']);
        
    } else if (!$_REQUEST["department"] && $_REQUEST["location"]) {
        $query = $conn->prepare('SELECT 
					p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location 
				  FROM personnel p 
				  LEFT JOIN department d ON (d.id = p.departmentID) 
				  LEFT JOIN location l ON (l.id = d.locationID) 
				  WHERE locationID = ?
				  ORDER BY p.lastName, p.firstName, d.name, l.name');

	    $query->bind_param("i", $_REQUEST['location']);

    } else {
        $query = $conn->prepare('SELECT 
					p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location 
				  FROM personnel p 
				  LEFT JOIN department d ON (d.id = p.departmentID) 
				  LEFT JOIN location l ON (l.id = d.locationID) 
				  WHERE locationID = ? AND departmentID = ?
				  ORDER BY p.lastName, p.firstName, d.name, l.name');

	    $query->bind_param("ii", $_REQUEST['location'], $_REQUEST['department']);
    }
	$query->execute();
    $result = $query->get_result();
	
	if (!$result) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}

    $data = [];

	while ($row = mysqli_fetch_assoc($result)) {

		array_push($data, $row);

	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = $data;
	
	mysqli_close($conn);

	echo json_encode($output); 

?>