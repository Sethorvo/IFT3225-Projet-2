import mysql.connector
from mysql.connector import Error
import json


# Connexion à MySQL
def connect_to_mysql(host, user, password):
    try:
        connection = mysql.connector.connect(host=host, user=user, password=password, database='ConceptNetDB')
        connection.reconnect()
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Erreur lors de la connexion à MySQL: {e}")
        return None


# Exécution d'une requête SQL
def execute_sql(connection, query):
    try:
        cursor = connection.cursor()
        cursor.execute(query)
        connection.commit()
    except Error as e:
        print(f"Erreur lors de l'exécution de la requête: {e}")


def load_data(filename):
    with open(filename, "r") as f:
        return json.load(f)


def insert_data(connection, facts):
    try:
        connection.reconnect()
        cursor = connection.cursor()
            # Vos opérations de base de données ici
    except mysql.connector.Error as e:
        print(f"Erreur SQL: {e}")
    finally:
        for fact in facts:
            start, relation, end = fact[0], fact[1], fact[2]

            cursor.execute(
                "INSERT INTO Concepts (label, language) VALUES (%s, 'en') ON DUPLICATE KEY UPDATE concept_id=LAST_INSERT_ID(concept_id)",
                (start,))
            start_id = cursor.lastrowid

            # Insérer ou récupérer l'ID pour le concept de fin
            cursor.execute(
                "INSERT INTO Concepts (label, language) VALUES (%s, 'en') ON DUPLICATE KEY UPDATE concept_id=LAST_INSERT_ID(concept_id)",
                (end,))
            end_id = cursor.lastrowid

            # Insérer ou récupérer l'ID pour la relation
            cursor.execute(
                "INSERT INTO Relations (label) VALUES (%s) ON DUPLICATE KEY UPDATE relation_id=LAST_INSERT_ID(relation_id)",
                (relation,))
            relation_id = cursor.lastrowid

            # Insérer le fait
            try:
                cursor.execute("INSERT INTO Facts (start_concept_id, relation_id, end_concept_id) VALUES (%s, %s, %s)",
                               (start_id, relation_id, end_id))
            except mysql.connector.Error as e:
                print(f"Erreur lors de l'insertion du fait: {e}")

        connection.commit()
        cursor.close()


# Script principal
def main():
    host = "localhost"  # Exemple: "localhost"
    user = "alex"  # Exemple: "root"
    password = "alex"  # Votre mot de passe MySQL

    db_creation_query = "CREATE DATABASE IF NOT EXISTS ConceptNetDB"
    use_db_query = "USE ConceptNetDB"

    concepts_table_query = """
        CREATE TABLE IF NOT EXISTS Concepts (
            concept_id INT AUTO_INCREMENT PRIMARY KEY,
            label VARCHAR(255) NOT NULL,
            language VARCHAR(2) NOT NULL,
            UNIQUE (label, language)
        );
    """

    relations_table_query = """
        CREATE TABLE IF NOT EXISTS Relations (
            relation_id INT AUTO_INCREMENT PRIMARY KEY,
            label VARCHAR(255) NOT NULL,
            UNIQUE (label)
        );
    """

    facts_table_query = """
        CREATE TABLE IF NOT EXISTS Facts (
            fact_id INT AUTO_INCREMENT PRIMARY KEY,
            start_concept_id INT NOT NULL,
            relation_id INT NOT NULL,
            end_concept_id INT NOT NULL,
            FOREIGN KEY (start_concept_id) REFERENCES Concepts(concept_id),
            FOREIGN KEY (relation_id) REFERENCES Relations(relation_id),
            FOREIGN KEY (end_concept_id) REFERENCES Concepts(concept_id)
        );
    """

    connection = connect_to_mysql(host, user, password)
    if connection:
        execute_sql(connection, db_creation_query)
        execute_sql(connection, use_db_query)
        execute_sql(connection, concepts_table_query)
        execute_sql(connection, relations_table_query)
        execute_sql(connection, facts_table_query)
        connection.close()
    else:
        print("Échec de la connexion à la base de données.")

    facts = load_data("facts_data.json")
    insert_data(connection, facts)


if __name__ == "__main__":
    main()
