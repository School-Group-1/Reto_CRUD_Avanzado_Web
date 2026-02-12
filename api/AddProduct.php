<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

ini_set('log_errors', 1);
ini_set('error_log', 'php_error.log');

header('Content-Type: application/json; charset=utf-8');

require_once '../controller/controller.php';

$name = $_POST['NAME'] ?? '';
$price = $_POST['PRICE'] ?? '';
$product_type = $_POST['PRODUCT_TYPE'] ?? '';
$description = $_POST['DESCRIPTION'] ?? '';
$imageName = $_POST['IMAGE_NAME'] ?? '';

if (isset($_FILES['IMAGE_FILE'])) {
    $file = $_FILES['IMAGE_FILE'];
    $filename = basename($file['name']);
    move_uploaded_file(
        $file['tmp_name'],
        "../view/assets/img/" . $filename
    );
    $imageName = $filename;
}

$controller = new controller();
$create = $controller->createProduct($name, $price, $product_type, $description, $imageName);

if ($create) {
    header("Content-Type: application/json; charset=UTF-8"); 
    http_response_code(200);
    echo json_encode([
        "success"   => true,
        "code" => 200,
        "message" => "Product created correctly.",
        "data" => ""
    ]);
} else {
    header("Content-Type: application/json; charset=UTF-8"); 
    http_response_code(500);
    echo json_encode([
        "success"   => false,
        "code" => 500,
        "message" => "Error creating the product.",
        "data" => ""
    ]);
}
?>
