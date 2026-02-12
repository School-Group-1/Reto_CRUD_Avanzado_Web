<?php
require_once 'User.php';
require_once 'Admin.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

ini_set('log_errors', 1);
ini_set('error_log', 'php_error.log');

class UserModel
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

public function loginUser($username, $password)
{
    $query = "SELECT * FROM PROFILE_ P JOIN USER_ U ON P.PROFILE_CODE = U.PROFILE_CODE
              WHERE USER_NAME = :username";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(":username", $username);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        return null; 
    }
    
    if (password_verify($password, $result['PSWD'])) {
       /* if (password_needs_rehash($result['PSWD'], PASSWORD_BCRYPT)) {
            $this->updatePasswordHash($result['PROFILE_CODE'], $password);
        }*/
        return $result;
    }
    
    if ($password === $result['PSWD']) {
        $this->migrateToHash($result['PROFILE_CODE'], $password);
        
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result;
    }
    return null;
}

private function migrateToHash($profile_code, $password)
{
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);
    
    $query = "UPDATE PROFILE_ SET PSWD = :password WHERE PROFILE_CODE = :profile_code";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':profile_code', $profile_code);
    $stmt->bindParam(':password', $passwordHash);
    
    return $stmt->execute();
}

/*private function updatePasswordHash($profile_code, $password)
{
    $newHash = password_hash($password, PASSWORD_BCRYPT);
    
    $query = "UPDATE PROFILE_ SET PSWD = :password WHERE PROFILE_CODE = :profile_code";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':profile_code', $profile_code);
    $stmt->bindParam(':password', $newHash);
    
    return $stmt->execute();
}*/

    public function loginAdmin($username, $password)
{
    $query = "SELECT * FROM PROFILE_ P JOIN ADMIN_ A ON P.PROFILE_CODE = A.PROFILE_CODE
              WHERE USER_NAME = :username";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(":username", $username);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        return null;
    }
    
    if (password_verify($password, $result['PSWD'])) {
        /*if (password_needs_rehash($result['PSWD'], PASSWORD_BCRYPT)) {
            $this->updatePasswordHash($result['PROFILE_CODE'], $password);
        }*/
        return $result;
    }
    
    if ($password === $result['PSWD']) {
        $this->migrateToHash($result['PROFILE_CODE'], $password);
        
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result;
    }
    
    return null;
}

    public function create_user($username, $pswd1)
{
    $checkQuery = "SELECT * FROM PROFILE_ WHERE USER_NAME = ?";
    $checkStmt = $this->conn->prepare($checkQuery);
    $checkStmt->bindValue(1, $username);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        return null;
    }

    $passwordHash = password_hash($pswd1, PASSWORD_BCRYPT);

    $createQuery = "CALL RegistrarUsuario(?, ?)";
    $createStmt = $this->conn->prepare($createQuery);
    $createStmt->bindValue(1, $username);
    $createStmt->bindValue(2, $passwordHash); 
    $createStmt->execute();
    
    $result = $createStmt->fetch(PDO::FETCH_ASSOC);
    return $result;
}


    public function get_all_users()
    {
        $query = "SELECT * FROM PROFILE_ AS P, USER_ AS U WHERE P.PROFILE_CODE = U.PROFILE_CODE";

        $stmt = $this->conn->prepare($query);

        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $result;
    }

    public function delete_user($id)
    {
        $query = "DELETE U, P FROM USER_ U JOIN PROFILE_ P ON P.PROFILE_CODE = U.PROFILE_CODE WHERE P.PROFILE_CODE = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            return TRUE;
        } else {
            return FALSE;
        }
    }

    public function modifyUser($email, $username, $telephone, $name, $surname, $gender, $card_no, $profile_code)
    {
        $query = "UPDATE USER_ U JOIN PROFILE_ P ON U.PROFILE_CODE = P.PROFILE_CODE 
        SET P.EMAIL = :email, P.USER_NAME = :username, P.TELEPHONE = :telephone, P.NAME_ = :name_, P.SURNAME = :surname, U.GENDER = :gender, U.CARD_NO = :card_no
        WHERE P.PROFILE_CODE = :profile_code";

        $stmt = $this->conn->prepare($query);
        $stmt->bindparam(':email', $email);
        $stmt->bindparam(':username', $username);
        $stmt->bindparam(':telephone', $telephone);
        $stmt->bindparam(':name_', $name);
        $stmt->bindparam(':surname', $surname);
        $stmt->bindparam(':gender', $gender);
        $stmt->bindparam(':card_no', $card_no);
        $stmt->bindparam(':profile_code', $profile_code);

        if ($stmt->execute()) {
            return true;
        } else {
            return false;
        }
    }

    public function modifyAdmin($email, $username, $telephone, $name, $surname, $current_account, $profile_code)
    {
        $query = "UPDATE ADMIN_ A JOIN PROFILE_ P ON A.PROFILE_CODE = P.PROFILE_CODE 
        SET P.EMAIL = :email, P.USER_NAME = :username, P.TELEPHONE = :telephone, P.NAME_ = :name_, P.SURNAME = :surname, A.CURRENT_ACCOUNT = :current_account
        WHERE P.PROFILE_CODE = :profile_code";

        $stmt = $this->conn->prepare($query);
        $stmt->bindparam(':email', $email);
        $stmt->bindparam(':username', $username);
        $stmt->bindparam(':telephone', $telephone);
        $stmt->bindparam(':name_', $name);
        $stmt->bindparam(':surname', $surname);
        $stmt->bindparam(':current_account', $current_account);
        $stmt->bindparam(':profile_code', $profile_code);

        if ($stmt->execute()) {
            return true;
        } else {
            return false;
        }
    }

    public function modifyPassword($password, $newPassword, $sessionActualP, $profile_code)
    {
        if (!password_verify($password, $sessionActualP)) {
            return false;
        }
    
        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);

        return $this->migrateToHash($profile_code, $newHash);
    }

    public function get_all_products()
    {
        $query = "SELECT * FROM PRODUCT";

        $stmt = $this->conn->prepare($query);

        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $result;
    }

    public function get_product_sizes($id)
    {
        $query = "SELECT * FROM SIZE S JOIN PRODUCT P ON P.PRODUCT_ID = S.PRODUCT_ID WHERE P.PRODUCT_ID = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $result;
    }

    public function get_product_company($id)
    {
        $query = "SELECT * FROM COMPANY C JOIN PRODUCT P ON P.COMPANY_ID = C.COMPANY_ID WHERE P.COMPANY_ID = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $result;
    }
}
?>