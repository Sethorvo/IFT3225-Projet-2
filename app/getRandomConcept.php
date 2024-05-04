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
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset: UTF-8"); // Sets the content type as JSON

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Respond to preflight request:
    header('HTTP/1.1 204 No Content');
    exit;
}
//if (session_status() === PHP_SESSION_ACTIVE) {
if (true) {

    //$user_id = $_SESSION["user_id"];
    $user_id = 1;

    // From https://www.mysqltutorial.org/mysql-basics/mysql-select-random/
    $sqlConcept = "SELECT term, label, language FROM Concepts ORDER BY RAND() LIMIT 1;";
    $response = $conn->query($sqlConcept)->fetch_assoc();

    $stmt = $conn->prepare("SELECT highscore_who FROM Users WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    
    $resultHighscore = $stmt->get_result()->fetch_assoc();

    $response["highscore"] = $resultHighscore["highscore_who"];
    
    echo json_encode($response);

}
else {
    header("HTTP/1.1 401 Unauthorized");
    exit;
}

$conn->close();
ob_end_flush();
?>