<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	header('Content-Type: application/json; charset=UTF-8');
  header('Access-Control-Allow-Origin: *');	

	$executionStartTime = microtime(true);

	$url = "https://api.goperigon.com/v1/all?from=2025-01-28&q=" . $_REQUEST["country"] . "&sourceGroup=top100&language=en&apiKey=96588d90-27f3-4cb7-b4cd-e2669c59ee8f";
	$ch = curl_init();

	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result = curl_exec($ch);

  $cURLERROR = curl_errno($ch);
  
  curl_close($ch);

	if ($cURLERROR) {

		$output['status']['code'] = $cURLERROR;
    $output['status']['name'] = "Failure - cURL";
    $output['status']['description'] = curl_strerror($cURLERROR);
		$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
		$output['data'] = null;

	} else {
    $newsInfo = json_decode($result,true);

    if (json_last_error() !== JSON_ERROR_NONE) {

      $output['status']['code'] = json_last_error();
      $output['status']['name'] = "Failure - JSON";
      $output['status']['description'] = json_last_error_msg();
      $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
      $output['data'] = null;

    } else {

      if (isset($newsInfo['error'])) {

        $output['status']['code'] = $newsInfo['error']['code'];
        $output['status']['name'] = "Failure - API";
        $output['status']['description'] = $newsInfo['error']['message'];
  	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
	  	  $output['data'] = null;

      } else {
        $finalResult['articles'] = [];
        foreach ($newsInfo['articles'] as $item) {

            $article['imageUrl'] = $item['imageUrl'];
            $article['title'] = $item['title'];
            $article['summary'] = $item['summary'];
            $article['pubDate'] = $item['pubDate'];
            $article['sourceName'] = $item['source']['domain'] ?? "News";
            $article['url'] = $item['url'];
  
            array_push($finalResult['articles'], $article);          
  
          }
        $output['status']['code'] = 200;
     	  $output['status']['name'] = "success";
        $output['status']['description'] = "all ok";
  	  	$output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
        $output['data'] = $finalResult;

      }

    }

	}

	echo json_encode($output, JSON_NUMERIC_CHECK); 

?>