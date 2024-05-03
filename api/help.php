<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: text/html');


echo "<html><head><title>Aide de l'API</title></head><body>";
echo "<h1>Aide pour l'API REST</h1>";
echo "<p>Cette API permet d'accéder à la BD et les tables de concepts, de relations et d'informations sur les utilisateurs :</p>";
echo "<ul>";
echo "<li><strong>Liste des Concepts :</strong> <a href='http://localhost/api/list_concepts'>http://localhost/api/list_concepts</a> - Récupère tous les concepts de la base de données.</li>";
echo "<li><strong>Liste des Relations :</strong> <a href='http://localhost/api/list_relations'>http://localhost/api/list_relations</a> - Récupère toutes les relations de la base de données.</li>";
echo "<li><strong>Liste des Utilisateurs :</strong> <a href='http://localhost/api/list_users'>http://localhost/api/list_users</a> - Récupère tous les utilisateurs et leurs scores de la base de données.</li>";
echo "<li><strong>Création d'un Utilisateur :</strong> Soumission de formulaire à <a href='http://localhost/api/create_user'>http://localhost/api/create_user</a> - Permet la création d'un nouvel utilisateur avec un nom d'utilisateur et un mot de passe.</li>";
echo "</ul>";
echo "</body></html>";

