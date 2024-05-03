<?php
include 'db_connect.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

$query = "SELECT label, language FROM Concepts";
$result = mysqli_query($conn, $query);


if ($result) {
    $concepts = mysqli_fetch_all($result);
    echo json_encode($concepts);
} else {
    echo json_encode(array("error" => mysqli_error($conn)));
}

mysqli_close($conn);
