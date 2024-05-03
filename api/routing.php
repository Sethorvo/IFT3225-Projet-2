<?php
use Kunststube\Router\Router,
    Kunststube\Router\Route;
require_once '../Router/Router.php';

// Repris des diapos REST API du cours
$router = new Router;

$router->add('/api/help', array(),
    function(Route $route) {
        include 'help.php';
        exit;
    });

$router->add('/api/list_concepts', array(),
    function(Route $route) {
        include 'list_concepts.php';
        exit;
    });

$router->add('/api/list_relations', array(),
    function(Route $route) {
        include 'list_relations.php';
        exit;
    });

$router->add('/api/list_users', array(),
    function(Route $route) {
        include 'list_users.php';
        exit;
    });

$router->add('/api/create_user', array() ,
    function(Route $route) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        include 'create_user.php';
    } else {
        header("HTTP/1.1 405 Method Not Allowed");
    }
});

// Get the current URI and method from the server environment
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];
$router->route($uri , $method);
