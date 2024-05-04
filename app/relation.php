<?php
include 'db_connect.php'; // Includes your database connection script
class Relation {

    // object properties
    public $relation_id;
    public $label;

    // constructor
    public function __construct($label) {
        $this->label = $label;
    }

    // method to ensure relation
    public function ensureRelation() {
        global $conn;
        $stmt = $conn->prepare("SELECT relation_id FROM Relations WHERE label = ?");
        $stmt->bind_param('s', $this->label);
        $stmt->execute();
        $stmt->bind_result($this->relation_id);

        if (!$stmt->fetch()) {
            $stmt = $conn->prepare("INSERT INTO Relations (label) VALUES (?)");
            $stmt->bind_param('s', $this->label);
            $stmt->execute();
            $this->relation_id = $stmt->insert_id;
        }
        return $this->relation_id;
    }
}
