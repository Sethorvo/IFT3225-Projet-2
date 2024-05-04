<?php
session_start();
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


//Pris du code de https://codeshack.io/secure-login-system-php-mysql/
if ( !isset($_POST['username']) and !isset($_POST['password']) ) {
    echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
}
$username = $_POST['username'];
$password = $_POST['password'];

$stmt = $conn->prepare('SELECT user_id FROM users WHERE username = ? AND password = ?');
if (!$stmt) {
    echo "Error preparing statement: " . $conn->error;
}
else {
    $stmt->bind_param('ss', $username, $password);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        
        $stmt->bind_result($user_id);
        $stmt->fetch();

        session_regenerate_id();

        $_SESSION['loggedin'] = TRUE;
        $_SESSION['username'] = $username;
        $_SESSION['user_id'] = $user_id;

        echo json_encode([
            'success' => true,
            'session' => [
                'loggedin' => $_SESSION['loggedin'],
                'username' => $_SESSION['username'],
                'user_id' => $_SESSION['user_id']
            ]
        ]);
        $stmt->close();
        }   

    else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    }
}

