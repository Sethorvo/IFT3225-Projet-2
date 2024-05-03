
<?php
include 'db_connect.php';

// turn off only warnings and notices, but keep errors:
// Repris de la demo
error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
// Set the display of errors and warnings to 'Off'
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset: UTF-8"); // Sets the content type as JSON

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Respond to preflight request:
    header('HTTP/1.1 204 No Content');
    exit;
}

if (isset($_POST["newHighscore"]) and isset($_POST["gameName"])) {

    $newHighscore = $_POST["newHighscore"];
    $gameName = $_POST["gameName"];

    if ($gameName === "guessWho" or $gameName === "related") { 

        $sql = "CALL ChangeHighscore(1, ".$newHighscore.", '".$gameName."');";

        $conn->query($sql)->fetch_array(MYSQLI_ASSOC);

    }
    else {
        header('HTTP/1.1 400 Bad Request');
        exit;        
    }

}
else {
    header('HTTP/1.1 400 Bad Request');
    exit;
}

$conn->close();

?>