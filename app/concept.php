<?php
include 'db_connect.php'; // Includes your database connection script

class Concept {

    // object properties
    public $concept_id;
    public $label;
    public $term;
    public $language;

    // constructor
    public function __construct($label, $term, $language) {
        $this->label = $label;
        $this->term = $term;
        $this->language = $language;
    }

    // method to ensure concept
    public function ensureConcept() {
        global $conn;
        $stmt = $conn->prepare("SELECT concept_id FROM Concepts WHERE label = ? AND language = ?");
        $stmt->bind_param('ss', $this->label, $this->language);
        $stmt->execute();
        $stmt->bind_result($this->concept_id);

        if (!$stmt->fetch()) {
            $stmt = $conn->prepare("INSERT INTO Concepts (label, term, language) VALUES (?, ?, ?)");
            $stmt->bind_param('sss', $this->label, $this->term, $this->language);
            $stmt->execute();
            $this->concept_id = mysqli_insert_id($conn);
        }
        return $this->concept_id;
    }
}
