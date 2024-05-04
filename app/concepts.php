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

class Concept {

    // object properties
    public $concept_id;
    public $label;
    public $term;
    public $language;
    public $created;

    // method to ensure concept
    public function ensureConcept() {
        global $conn;
        $stmt = $conn->prepare("SELECT concept_id FROM Concepts WHERE label = ? AND language = ?");
        $stmt->bind_param('ss', $this->label, $this->language);
        $stmt->execute();
        $concept_id = "";
        $stmt->bind_result($concept_id);

        if ($stmt->fetch()) {
            return $concept_id;
        } else {
            $stmt = $conn->prepare("INSERT INTO Concepts (label, term, language) VALUES (?, ?, ?)");
            $stmt->bind_param('sss', $this->label, $this->term, $this->language);
            $stmt->execute();
            return mysqli_insert_id($conn);
        }
    }

    // method to ensure relation
    public static function ensureRelation($label) {
        global $conn;
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

    // method to insert fact
    public static function insertFact($startId, $relationId, $endId) {
        global $conn;
        $stmt = $conn->prepare("INSERT INTO Facts (start_concept_id, relation_id, end_concept_id) VALUES (?, ?, ?)");
        $stmt->bind_param('sss', $startId, $relationId, $endId);

        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Data inserted successfully!'];
        }
        else {
            return ['success' => false, 'message' => $stmt->error];
        }
    }

    // method to insert facts and concepts from JSON
    public static function insertData($jsonData) {
        global $conn;
        // loop through JSON data and insert into database
        foreach ($jsonData as $item) {
            $startTerm = substr($item['start']['term'], 6);
            $endTerm = substr($item['end']['term'], 6);

            $startConcept = new Concept();
            $startConcept->label = $item['start']['label'];
            $startConcept->term = $startTerm;
            $startConcept->language = $item['start']['language'];
            $startId = $startConcept->ensureConcept();

            $relationId = Concept::ensureRelation($item['rel']['label']);

            $endConcept = new Concept();
            $endConcept->label = $item['end']['label'];
            $endConcept->term = $endTerm;
            $endConcept->language = $item['end']['language'];
            $endId = $endConcept->ensureConcept();

            $response = Concept::insertFact($startId, $relationId, $endId);
            echo json_encode($response);
        }
    }
}
