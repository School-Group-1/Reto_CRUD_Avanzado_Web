<?php
    session_start();

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    ini_set('log_errors', 1);
    ini_set('error_log', 'php_error.log');

    header("Content-Type: application/json");

    $data = json_decode(file_get_contents("php://input"), true);

    $_SESSION["user"] = $data;

    $user = array_diff_key($data, array_flip(["PSWD"]));

    header("Content-Type: application/json; charset=UTF-8"); 
    http_response_code(200);
    echo json_encode([
        "success"   => true,
        "code" => 200,
        "message" => "User has been set.",
        "data" => $user
    ]);
?>