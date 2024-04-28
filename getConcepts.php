<?php
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
header("Content-Type: application/json"); // Sets the content type as JSON

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Respond to preflight request:
    header('HTTP/1.1 204 No Content');
    exit;
}

$servername = "localhost"; //www-ens pour DIRO
$username = "root"; //nom_usager pour DIRO
$password = ""; //MDP MySQL pour DIRO
$dbname = "conceptnetdb"; //nom_usager_nomBD pour DIRO

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


$sql = "SELECT f.fact_id, c1.label as start_concept, r.label, c2.label as end_concept
        FROM Facts f
        JOIN Concepts c1 ON f.start_concept_id = c1.concept_id
        JOIN Concepts c2 ON f.end_concept_id = c2.concept_id
        JOIN Relations r ON f.relation_id = r.relation_id";
$result = $conn->query($sql);

$facts = [];

if ($result->num_rows > 0) {
    // Output data of each row
    while($row = $result->fetch_assoc()) {
        $facts[] = $row;
    }
    echo json_encode($facts);
} else {
    echo "0 results";
}

$conn->close();
ob_end_flush();
?>
