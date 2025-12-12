<?php
session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

ini_set('log_errors', 1);
ini_set('error_log', 'php_error.log');

header("Content-Type: application/json");

require_once '../controller/controller.php';

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

$controller = new controller();
$user = $controller->loginUser($username, $password);

if (is_null($user)) {
    $admin = $controller->loginAdmin($username, $password);

    if (is_null($admin)) {

        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(400);
        echo json_encode([
            "success"   => false,
            "code" => 400,
            "message" => "Username or password incorrect.",
            "data" => ""
        ]);
    } else {
        $_SESSION["user"] = $admin;
        $_SESSION["role"] = "admin";

        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(200);
        echo json_encode([
            "success"   => true,
            "code" => 200,
            "message" => "Login successful for an Admin.",
            "data" => $admin
        ]);
    }
} else {
    $_SESSION["user"] = $user;
    $_SESSION["role"] = "user";

    header("Content-Type: application/json; charset=UTF-8"); 
    http_response_code(200);
    echo json_encode([
        "success"   => true,
        "code" => 200,
        "message" => "Login successful for a User.",
        "data" => $user
    ]);
}
?>