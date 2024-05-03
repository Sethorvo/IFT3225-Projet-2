<?php

include 'db_connect.php'; // Includes your database connection script
// turn off only warnings and notices, but keep errors:
// Repris de la demo
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json"); // Sets the content type as JSON

$queries = [
    'SELECT COUNT(*) as count FROM Concepts',
    'SELECT COUNT(*) as count FROM Relations',
    'SELECT COUNT(*) as count FROM Facts',
    'SELECT COUNT(*) as count FROM Users'
];

foreach ($queries as $query) {
    $result = $conn->query($query);
    if ($result) {
        $row = $result->fetch_assoc();
        $results[] = $row['count'];
    } else {
        $results[] = "Error: " . $conn->error;
    }
}

$conn->close();
echo json_encode($results);

