<?php
include 'db_connect.php';
ob_start();
// fetch_facts.php

// turn off only warnings and notices, but keep errors:
// Repris de la demo
error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
// Set the display of errors and warnings to 'Off'
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset: UTF-8"); // Sets the content type as JSON

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Respond to preflight request:
    header('HTTP/1.1 204 No Content');
    exit;
}

// From https://www.mysqltutorial.org/mysql-basics/mysql-select-random/
$sql = "SELECT label, language FROM Concepts ORDER BY RAND() LIMIT 1;";

$result = $conn->query($sql)->fetch_array(MYSQLI_ASSOC);

echo json_encode($result);

$conn->close();
ob_end_flush();
?>