<?php

include 'db_connect.php'; // Includes your database connection script
include 'fact.php';

// turn off only warnings and notices, but keep errors:
// Repris de la demo
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json"); // Sets the content type as JSON


// read JSON data from POST request
$jsonData = json_decode(file_get_contents('php://input'), true);

// call the insertData method with the JSON data as an argument
Fact::insertData($jsonData);
