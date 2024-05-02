import mysql.connector
from mysql.connector import Error
import json
import sqlparse
import sys
from pathlib import Path

mainDirectory = Path(__file__).absolute().parent.parent


# Connexion à MySQL
def connectToMySQL(host, user, password):
    try:
        #Pour que le script fonctionne sur un ordinateur DIRO le nom_usager + "_" doit etre ajouter au debut du nom de BD
        connection = mysql.connector.connect(host=host, user=user, password=password)

        return connection
        
    except Error as e:
        print(f"Erreur lors de la connexion à MySQL: {e}")
        return None


def loadData():
    with open(mainDirectory/"app"/"facts_data.json", "r") as f:
        return json.load(f)


def insertData(connection, facts):

    try:

        cursor = connection.cursor()

        for fact in facts:

            start, relation, end, lang = fact[0], fact[1], fact[2], fact[3]

            cursor.execute(
                "INSERT INTO Concepts (label, language) VALUES (%s, %s) ON DUPLICATE KEY UPDATE concept_id=LAST_INSERT_ID(concept_id)",
                (start, lang))
            start_id = cursor.lastrowid

            # Insérer ou récupérer l'ID pour le concept de fin
            cursor.execute(
                "INSERT INTO Concepts (label, language) VALUES (%s, %s) ON DUPLICATE KEY UPDATE concept_id=LAST_INSERT_ID(concept_id)",
                (end, lang))
            end_id = cursor.lastrowid

            # Insérer ou récupérer l'ID pour la relation
            cursor.execute(
                "INSERT INTO Relations (label) VALUES (%s) ON DUPLICATE KEY UPDATE relation_id=LAST_INSERT_ID(relation_id)",
                (relation,))
            relation_id = cursor.lastrowid

            # Insérer le fait
            cursor.execute("INSERT INTO Facts (start_concept_id, relation_id, end_concept_id) VALUES (%s, %s, %s)",
                            (start_id, relation_id, end_id))


        connection.commit()
        cursor.close()
        
    except mysql.connector.Error as e:
        print(f"Erreur SQL: {e}")


def selectDatabase(connection):

        dbName = "conceptnetdb"

        if connection._host == "www-ens":
            dbName = connection._user + "_" + dbName

        try:
            cursor = connection.cursor()

            cursor.execute("CREATE DATABASE IF NOT EXISTS " + dbName + ";")
            connection.commit()

            cursor.execute("USE " + dbName + ";")
            connection.commit()

        except Error as e:
            print(f"Erreur lors de la connexion à la database: {e}")

def runSetupQueries(connection, query):

    statements = sqlparse.split(sqlparse.format(query, strip_comments=True))

    try:

        selectDatabase(connection)

        cursor = connection.cursor()

        for statement in statements:

            cursor.execute(statement)
            connection.commit()

        cursor.close()

    except Error as e:
        print(f"Erreur lors de l'exécution de la requête: {e}")


# Script principal
def main():
    host = "localhost" if len(sys.argv) < 2 else sys.argv[1]  # "www-ens" Pour la machine DIRO
    user = "root" if len(sys.argv) < 3 else sys.argv[2]  # "nom_usager" Pour la machine DIRO
    password = "" if len(sys.argv) < 4 else sys.argv[3]  # Votre mot de passe MySQL sur la machine DIRO

    connection = connectToMySQL(host, user, password)

    if connection:

        sqlSetupFile = open(mainDirectory/"setup"/"init.sql", "r")

        runSetupQueries(connection, sqlSetupFile.read())

        facts = loadData()
        insertData(connection, facts)

        sqlSetupFile.close()

        connection.close()
        
    else:
        print("Échec de la connexion à la base de données.")

if __name__ == "__main__":
    main()
