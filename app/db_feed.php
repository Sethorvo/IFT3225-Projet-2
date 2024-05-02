<?php

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


// https://stackoverflow.com/questions/11320796/saving-json-string-to-mysql-database
$jsonData = json_decode(file_get_contents('php://input'), true);

function ensureConcept($label, $language, $conn) {
    $stmt = $conn->prepare("SELECT concept_id FROM Concepts WHERE label = ? AND language = ?");
    $stmt->bind_param('ss', $label, $language);
    $stmt->execute();
    $concept_id = "";
    $stmt->bind_result($concept_id);

    if ($stmt->fetch()) {
        return $concept_id;
    } else {
        $stmt = $conn->prepare("INSERT INTO Concepts (label, language) VALUES (?, ?)");
        $stmt->bind_param('ss', $label, $language);
        $stmt->execute();
        return mysqli_insert_id($conn);
    }
}

function ensureRelation($label, $conn) {
    $stmt = $conn->prepare("SELECT relation_id FROM Relations WHERE label = ?");
    $stmt->bind_param('s', $label);
    $stmt->execute();
    $relation_id = "";
    $stmt->bind_result($relation_id);

    if ($stmt->fetch()) {
        return $relation_id;

    } else {
        $stmt = $conn->prepare("INSERT INTO Relations (label) VALUES (?)");
        $stmt->bind_param('s', $label);
        $stmt->execute();
        return mysqli_insert_id($conn);
    }
}

foreach ($jsonData as $item) {

    $startId = ensureConcept($item['start']['label'], $item['start']['language'], $conn);
    $relationId = ensureRelation($item['rel']['label'], $conn);
    $endId = ensureConcept($item['end']['label'], $item['end']['language'], $conn);

    $stmt = $conn->prepare("INSERT INTO Facts (start_concept_id, relation_id, end_concept_id) VALUES (?, ?, ?)");
    $stmt->bind_param('sss', $startId, $relationId, $endId);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Data inserted successfully!']);
    }
    else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }
} 
