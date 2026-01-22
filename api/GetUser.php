<?php
    session_start();

    if (isset($_SESSION["user"]) && is_array($_SESSION["user"])) {
        $data = array_diff_key($_SESSION["user"], array_flip(["PSWD"]));

        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(200);
        echo json_encode([
            "success"   => true,
            "code" => 200,
            "message" => "User has been found.",
            "data" => $data
        ], JSON_UNESCAPED_UNICODE);
    } else{
        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(401);
        echo json_encode([
            "success"   => false,
            "code" => 401,
            "message" => "User is not set.",
            "data" => ""
        ]);
    }
?>