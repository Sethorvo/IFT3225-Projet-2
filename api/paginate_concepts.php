<?php
include '../app/db_connect.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

$resultsPerPage = 20;

// Check if the page number is provided and if it's a positive integer
if (isset($_GET['page']) && filter_var($_GET['page'], FILTER_VALIDATE_INT, array('min_range' => 1))) {
    $page = $_GET['page'];
} else {
    $page = 1;
}

// Calculate the offset for the SQL query
$offset = ($page - 1) * $resultsPerPage;

$query = "SELECT label, language FROM Concepts LIMIT $resultsPerPage OFFSET $offset";
$result = mysqli_query($conn, $query);

if ($result) {
    $concepts = mysqli_fetch_all($result);
    echo json_encode($concepts, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(array("error" => mysqli_error($conn)));
}

$conn->close();
