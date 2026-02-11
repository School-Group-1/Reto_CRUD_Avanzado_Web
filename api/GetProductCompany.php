<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once '../controller/controller.php';

$id = $_GET['id'] ?? '';

$controller = new controller();
$company = $controller->get_product_company($id);

if ($company) {
    header("Content-Type: application/json; charset=UTF-8"); 
    http_response_code(200);
    echo json_encode([
        "success"   => true,
        "code" => 200,
        "message" => "Company retrieved successfully",
        "data" => $company,
    ]);
} else {
    header("Content-Type: application/json; charset=UTF-8"); 
    http_response_code(404);
    echo json_encode([
        "success"   => false,
        "code" => 404,
        "message" => "Company not found",
        "data" => "",
    ]);
}
?>