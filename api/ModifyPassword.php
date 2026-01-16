<?php
session_start();
var_dump($_SESSION); 
exit;

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once '../controller/controller.php';

$input = json_decode(file_get_contents('php://input'), true);
$password = $input['password'] ?? '';
$newPassword = $input['newPassword'] ?? '';
$sessionActualP = $_SESSION["user"]["PSWD"];
$profile_code = $_SESSION["user"]["PROFILE_CODE"];

$controller = new controller();
$modify = $controller->modifyPassword($password, $newPassword, $sessionActualP, $profile_code);

if ($modify) {
    header("Content-Type: application/json; charset=UTF-8"); 
    http_response_code(200);
    echo json_encode([
        "success"   => true,
        "code" => 200,
        "message" => "Password modified correctly.",
        "data" => ""
    ]);
} else {
    header("Content-Type: application/json; charset=UTF-8"); 
    http_response_code(500);
    echo json_encode([
        "success"   => false,
        "code" => 500,
        "message" => "Error modifying the password.",
        "data" => ""
    ]);
}
?>