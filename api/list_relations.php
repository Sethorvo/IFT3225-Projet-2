<?php
include '../app/db_connect.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

$query = "SELECT label FROM Relations";
$result = mysqli_query($conn, $query);


if ($result) {
    $relations = mysqli_fetch_all($result);
    echo json_encode($relations, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(array("error" => mysqli_error($conn)));
}

$conn->close();

