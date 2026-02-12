<?php
    session_start();

    if (isset($_SESSION["product"]) && is_array($_SESSION["product"])) {
        $data = $_SESSION["product"];

        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(200);
        echo json_encode([
            "success"   => true,
            "code" => 200,
            "message" => "Product has been found.",
            "data" => $data
        ], JSON_UNESCAPED_UNICODE);
    } else{
        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(401);
        echo json_encode([
            "success"   => false,
            "code" => 401,
            "message" => "Product is not set.",
            "data" => ""
        ]);
    }
?>