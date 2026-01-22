<?php
    session_start();

    if (isset($_SESSION["profile"])) {
        $data = array_diff_key($_SESSION["profile"], array_flip(["PSWD"]));

        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(200);
        echo json_encode([
            "success"   => true,
            "code" => 200,
            "message" => "Login successful for the profiile.",
            "data" => $data
        ]);
    } else{
        header("Content-Type: application/json; charset=UTF-8"); 
        http_response_code(401);
        echo json_encode([
            "success"   => false,
            "code" => 401,
            "message" => "Profile is not signed in.",
            "data" => ""
        ]);
    }
?>