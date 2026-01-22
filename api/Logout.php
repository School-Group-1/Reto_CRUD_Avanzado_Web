<?php
    session_start();

    if (isset($_SESSION["profile"])) {
        session_destroy();

        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(200);
        echo json_encode([
            "success"   => true,
            "code" => 200,
            "message" => "Logout successful for a User.",
            "data" => ""
        ]);
    }else{
        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(401);
        echo json_encode([
            "success"   => false,
            "code" => 401,
            "message" => "User is not signed in.",
            "data" => ""
        ]);
    }
?>