<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

$source = 'http://analev:8080';
$request = $_SERVER['REQUEST_URI'];
$cookie = getallheaders()['Cookie'];

if (substr($request, 0, 9) === "/analev-r") {
    $request = substr($request, 9, strlen($request));
}

$ch = curl_init();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    curl_setopt($ch, CURLOPT_POST, TRUE);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $_POST);
}
curl_setopt($ch, CURLOPT_URL, $source . $request);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, array("Cookie: " . $cookie));
curl_setopt($ch, CURLOPT_HEADER, 1);

$response = curl_exec($ch);
$mime = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$header_text = substr($response, 0, $header_size);
$body = substr($response, $header_size);

foreach (explode("\r\n", $header_text) as $i => $line) {
    if ($i != 0 || $line != '') {
        header($line);
    }
}

echo $body;

curl_close($ch);


/*$source = 'http://10.6.2.105:8080';
$target = 'http://localhost:80';
$request = $_SERVER['REQUEST_URI'];
$request = str_replace('/analev-r', '', $request);

$ch = curl_init();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    curl_setopt($ch, CURLOPT_POST, TRUE);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $_POST);
}
curl_setopt($ch, CURLOPT_URL, $source . $request);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$response = curl_exec($ch);
$response = str_replace('http://0.0.0.0:8080', $target . '/analev-r', $response);
echo $response;
curl_close($ch);*/