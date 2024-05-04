
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

    $user_id = 1;

    $newHighscore = $_POST["newHighscore"];
    $gameName = $_POST["gameName"];

    if ($gameName === "guessWho" or $gameName === "related") { 

        $fieldName = ($gameName === "guessWho") ? "highscore_who" : "highscore_related";

        $stmt = $conn->prepare("SELECT ".$fieldName." AS highscore FROM Users WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute(); 
        
        $currentHighscore = $stmt->get_result()->fetch_assoc()["highscore"];

        if ($currentHighscore < $newHighscore) {

            $stmt = $conn->prepare("UPDATE users SET ".$fieldName." = ? WHERE user_id = ?;");
            $stmt->bind_param("ii", $newHighscore, $user_id);
            $stmt->execute(); 

        }

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