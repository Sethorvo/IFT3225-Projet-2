<?php
use Kunststube\Router\Router,
    Kunststube\Router\Route;
require_once '../Router/Router.php';

// Repris des diapos REST API du cours
$p = "/hiver/~eyrollea/Technologie-Web-Projet-2/api";
$router = new Router;

$router->add('/help', array(),
    function(Route $route) {
        include 'help.php';
        exit;
    });

$router->add('/list_concepts', array(),
    function(Route $route) {
        include 'list_concepts.php';
        exit;
    });

$router->add('/list_concepts_paginated', array(),
    function(Route $route) {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            include 'list_concepts_paginated.php';
        } else {
            header("HTTP/1.1 405 Method Not Allowed");
        }
});    

$router->add('/list_relations', array(),
    function(Route $route) {
        include 'list_relations.php';
        exit;
    });

$router->add('/list_users', array(),
    function(Route $route) {
        include 'list_users.php';
        exit;
    });

$router->add('/create_user', array() ,
    function(Route $route) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        include 'create_user.php';
    } else {
        header("HTTP/1.1 405 Method Not Allowed");
    }
});

$router->route($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);
