<?php
session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../controller/controller.php';
header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$pswd1 = $input['pswd1'] ?? '';
$pswd2 = $input['pswd2'] ?? '';

try {

    $controller = new controller();
    $user = $controller->create_user($username, $pswd1);

    if ($user) {
        $_SESSION["profile"] = $user;

        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "code" => 200,
            "message" => "User created successfully.",
            "data" => array_diff_key($_SESSION["profile"], array_flip(["PSWD"]))
        ]);
    } else {
        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(400);
        echo json_encode([
            "success"   => false,
            "code" => 400,
            "message" => "No se ha podido crear el usuario.",
            "data" => ""
        ]);
    }
} catch (Exception $e) {
    error_log($e->getMessage());

    header("Content-Type: application/json; charset=UTF-8"); 
    http_response_code(500);
    echo json_encode([
        "success"   => false,
        "code" => 500,
        "message" => $e->getMessage(),
        "data" => ""
    ]);
}
?>

