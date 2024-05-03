<?php
include '../app/db_connect.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $password = mysqli_real_escape_string($conn, $_POST['password']);

    // SQL query to insert a new user with a default score of 0
    $query = "INSERT INTO Users (username, password, highscore_who, highscore_related) VALUES ( ?, ?, 0, 0)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $username, $password);
    $stmt->execute();

    if (!$stmt->error) {
        echo json_encode(array("message" => "User created successfully"));
        $stmt->close();
    } else {
        echo json_encode(array("error" => mysqli_error($conn)));
    }
} else {
    echo json_encode(array("error" => "Invalid request method"));
}
$conn->close();