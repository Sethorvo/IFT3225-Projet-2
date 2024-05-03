<?php
include 'db_connect.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $password = mysqli_real_escape_string($conn, $_POST['password']);

    // SQL query to insert a new user with a default score of 0
    $query = "INSERT INTO Users (username, password, highscore) VALUES ('$username', '$password', 0, 0)";
    $result = mysqli_query($conn, $query);

    if ($result) {
        echo json_encode(array("message" => "User created successfully"));
    } else {
        echo json_encode(array("error" => mysqli_error($conn)));
    }
} else {
    echo json_encode(array("error" => "Invalid request method"));
}

mysqli_close($conn);  // Close the database connection