<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once '../controller/controller.php';

$id = $_GET['id'] ?? '';

$controller = new controller();
$result = $controller->delete_product($id);

if ($result) {
    header("Content-Type: application/json; charset=UTF-8"); 
    http_response_code(200);
    echo json_encode([
        "success"   => true,
        "code" => 200,
        "message" => "Product deleted successfully.",
        "data" => TRUE
    ]);
} else {
    header("Content-Type: application/json; charset=UTF-8"); 
    http_response_code(404);
    echo json_encode([
        "success"   => true,
        "code" => 404,
        "message" => "Product not found.",
        "data" => FALSE
    ]);
}
?>