
-- From https://stackoverflow.com/questions/4922189/drop-multiple-tables-in-one-shot-in-mysql
SET foreign_key_checks = 0;
DROP TABLE IF EXISTS Concepts, Relations, Facts;
SET foreign_key_checks = 1;

CREATE TABLE Concepts (
    concept_id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    term VARCHAR(255) NOT NULL,
    language VARCHAR(2) NOT NULL,
    UNIQUE (label, language)
);

CREATE TABLE Relations (
    relation_id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    UNIQUE (label)
);

CREATE TABLE Facts (
    fact_id INT AUTO_INCREMENT PRIMARY KEY,
    start_concept_id INT NOT NULL,
    relation_id INT NOT NULL,
    end_concept_id INT NOT NULL,

    FOREIGN KEY (start_concept_id) REFERENCES Concepts(concept_id),
    FOREIGN KEY (relation_id) REFERENCES Relations(relation_id),
    FOREIGN KEY (end_concept_id) REFERENCES Concepts(concept_id)
);

CREATE TABLE Users (
   user_id INT AUTO_INCREMENT PRIMARY KEY,
   username VARCHAR(255) NOT NULL UNIQUE,
   password VARCHAR(255) NOT NULL,
   highscore INT DEFAULT 0
);
