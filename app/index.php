<?php
include 'db_connect.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
//Pris de la démo 25 mars et 8 avril

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';

// Serve API documentation HTML
switch (true) {
    case preg_match("/^\/api\/list_concepts$/", $requestUri):
        serveListConcepts();
        break;

    case preg_match("/^\/api\/list_relations$/", $requestUri):
        serveListRelations();
        break;

    case preg_match("/^\/api\/list_users$/", $requestUri):
        serveListUsers();
        break;

    case ($requestUri == '/api/create_user' && $requestMethod == 'POST'):
        serveCreateUser();
        break;

    default:
        handleOtherRequests();
        break;
}
// Define functions to include the respective files based on the URI
function serveListConcepts() {
    include 'list_concepts.php';
}

function serveListRelations() {
    include 'list_relations.php';
}

function serveListUsers() {
    include 'list_users.php';
}

function serveCreateUser() {
    include 'create_user.php';
}

function handleOtherRequests() {
    http_response_code(404);
    $_SESSION['state'] = "404";
    $_SESSION['state_statement'] = "La page que vous cherchez n'existe pas";
    echo json_encode(array('error' => 'Resource not found.'));
    exit;

}


