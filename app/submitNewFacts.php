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

if (isset($_POST["facts"])) {

    foreach ($_POST["facts"] as $fact) {

        // The first concept is the potentially new concept
        $firstConceptIsStart = is_string($fact["rel"]["end"]);

        $language = $fact["language"];

        // Get the first concept id

        $firstConceptId;

        $firstConceptInfos = ($firstConceptIsStart) ? $fact["rel"]["start"] : $fact["rel"]["end"];
        $conceptTerm = $firstConceptInfos["term"];
        $conceptLabel = $firstConceptInfos["label"];

        $getConceptStmt = $conn->prepare("SELECT concept_id FROM Concepts WHERE term = ? AND language = ?");
        $getConceptStmt->bind_param("ss", $conceptTerm, $language);
        $getConceptStmt->execute();

        $result = $getConceptStmt->get_result();

        // Concept is new
        if ($result->num_rows === 0) {

            // Insert the new concept
            $stmt = $conn->prepare("INSERT INTO Concepts(label, term, language) VALUES(?, ?, ?)");
            $stmt->bind_param("sss", $conceptLabel, $conceptTerm, $language);
            $stmt->execute();

            // Retrieves its id
            $getConceptStmt->execute();
            $result = $getConceptStmt->get_result();

        }

        $firstConceptId = $result->fetch_assoc()["concept_id"];

        // Get the second concept id
        $conceptTerm = ($firstConceptIsStart) ? $fact["rel"]["end"] : $fact["rel"]["start"];
        $getConceptStmt->execute();
        $secondConceptId = $getConceptStmt->get_result()->fetch_assoc()["concept_id"];

        // Determine which concept is the start and which is the end 
        $startConceptId = $firstConceptIsStart ? $firstConceptId : $secondConceptId;
        $endConceptId = $firstConceptIsStart ? $secondConceptId : $firstConceptId;

        // Get the relation ID
        $relationLabel = $fact["rel"]["relLabel"];
      
        $getRelationStmt = $conn->prepare("SELECT relation_id FROM Relations WHERE label = ?");
        $getRelationStmt->bind_param("s", $relationLabel);
        $getRelationStmt->execute();

        $result = $getRelationStmt->get_result();

        // Relation is new
        if ($result->num_rows === 0) {

            // Insert the new relation
            $stmt = $conn->prepare("INSERT INTO Relations(label) VALUES (?)");
            $stmt->bind_param("s", $relationLabel);
            $stmt->execute();

            // Retrieves its id
            $getRelationStmt->execute();
            $result = $getRelationStmt->get_result();

        }

        $relationId = $result->fetch_assoc()["relation_id"];

        // Finally, handle the fact insertion
        $stmt = $conn->prepare("SELECT EXISTS (SELECT * FROM Facts WHERE start_concept_id = ? AND relation_id = ? AND end_concept_id = ?) AS factExists");
        $stmt->bind_param("iii", $startConceptId, $relationId, $endConceptId);
        $stmt->execute();

        $factExists = $stmt->get_result()->fetch_assoc()["factExists"];

        if (!$factExists) {

            $stmt = $conn->prepare("INSERT INTO Facts(start_concept_id, relation_id, end_concept_id) VALUES (?, ?, ?)");
            $stmt->bind_param("iii", $startConceptId, $relationId, $endConceptId);
            $stmt->execute();            

        }

    }

}
else {
    header('HTTP/1.1 400 Bad Request');
    exit;
}
?>