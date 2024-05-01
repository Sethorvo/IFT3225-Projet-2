
<?php
// Database configuration
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
?>
