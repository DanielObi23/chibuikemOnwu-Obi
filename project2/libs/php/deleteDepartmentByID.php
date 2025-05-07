<?php

	// example use from browser
	// use insertDepartment.php first to create new dummy record and then specify it's id in the command below
	// http://localhost/companydirectory/libs/php/deleteDepartmentByID.php?id=<id>

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

	$checkQuery = $conn->prepare('SELECT COUNT(id) as count FROM personnel WHERE departmentID = ?');
	$checkQuery->bind_param("i", $_GET['id']);
	$checkQuery->execute();
	
	if (false === $checkQuery) {
		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "check query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 
		exit;
	}
	
	$result = $checkQuery->get_result();
	$row = $result->fetch_assoc();
	
	// If the department is used in personnel, return an error
	if ($row['count'] > 0) {
		$output['status']['code'] = "409"; 
		$output['status']['name'] = "conflict";
		$output['status']['description'] = "Cannot delete department because it is being used by " . $row['count'] . " personnel(s)";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];
		
		mysqli_close($conn);
		echo json_encode($output);
		exit;
	}

	$query = $conn->prepare('DELETE FROM department WHERE id = ?');
	
	$query->bind_param("i", $_GET['id']);

	$query->execute();
	
	if (false === $query) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "Department deleted successfully";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = [];
	
	mysqli_close($conn);

	echo json_encode($output); 

?>