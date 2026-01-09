<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

ini_set('log_errors', 1);
ini_set('error_log', 'php_error.log');

header('Content-Type: application/json; charset=utf-8');

require_once '../controller/controller.php';

$profile_code = $_GET['profile_code'] ?? '';
$email = $_GET['email'] ?? '';
$username = $_GET['username'] ?? '';
$telephone = $_GET['telephone'] ?? '';
$name = $_GET['name'] ?? '';
$surname = $_GET['surname'] ?? '';
$gender = $_GET['gender'] ?? '';
$card_no = $_GET['card_no'] ?? '';
//$telephone = filter_input(INPUT_POST, 'telephone', FILTER_VALIDATE_INT);

$controller = new controller();
$modify = $controller->modifyUser($email, $username, $telephone, $name, $surname, $gender, $card_no, $profile_code);

//if (!filter_var($telephone, FILTER_VALIDATE_INT) == false) {
    if ($modify) {
        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(200);
        echo json_encode([
            "success"   => true,
            "code" => 200,
            "message" => "User modified correctly.",
            "data" => "works"
        ]);
    } else {
        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(500);
        echo json_encode([
            "success"   => false,
            "code" => 500,
            "message" => "Error modifying the user.",
            "data" => ""
        ]);
    }
/*}else{
    header("Content-Type: application/json; charset=UTF-8"); 
    http_response_code(400);
    echo json_encode([
        "success"   => false,
        "code" => 400,
        "message" => "Error: incorrect data inputed.",
        "data" => ""
    ]);
}*/
?>