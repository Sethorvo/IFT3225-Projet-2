<?php
// fetch_facts.php
header("Access-Control-Allow-Origin: *"); // Allows all domains
header("Content-Type: application/json"); // Sets the content type as JSON

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "conceptnetdb";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


$sql = "SELECT f.fact_id, c1.label as start_concept, r.label, c2.label as end_concept
        FROM facts f
        JOIN concepts c1 ON f.start_concept_id = c1.concept_id
        JOIN concepts c2 ON f.end_concept_id = c2.concept_id
        JOIN relations r ON f.relation_id = r.relation_id";
$result = $conn->query($sql);

$facts = [];

if ($result->num_rows > 0) {
    // Output data of each row
    while($row = $result->fetch_assoc()) {
        $facts[] = $row;
    }
    echo json_encode($facts);
} else {
    echo "0 results";
}

$conn->close();
?>
