<?php
include 'db_connect.php'; // Includes your database connection script
include 'relation.php'; // Includes your database connection script
include 'concept.php'; // Includes your database connection script
class Fact {

    public $start_id;
    public $relation_id;
    public $end_id;

    // constructor
    public function __construct($start_id, $relation_id, $end_id) {
        $this->start_id = $start_id;
        $this->relation_id = $relation_id;
        $this->end_id = $end_id;
    }

    // method to insert fact
    public function insertFact(): array
    {
        global $conn;
        $stmt = $conn->prepare("INSERT INTO Facts (start_concept_id, relation_id, end_concept_id) VALUES (?, ?, ?)");
        $stmt->bind_param('sss', $this->start_id, $this->relation_id, $this->end_id);

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

            $startConcept = new Concept($item['start']['label'], $startTerm, $item['start']['language']);
            $startId = $startConcept->ensureConcept();

            $relation = new Relation($item['rel']['label']);
            $relationId = $relation->ensureRelation();

            $endConcept = new Concept($item['end']['label'], $endTerm, $item['end']['language']);
            $endId = $endConcept->ensureConcept();

            $Fact = new Fact($startId, $relationId, $endId);
            $response = $Fact->insertFact();

            echo json_encode($response);
        }
    }
}
