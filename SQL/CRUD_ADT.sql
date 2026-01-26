CREATE DATABASE IF NOT EXISTS CRUD_ADT;
USE CRUD_ADT;

CREATE TABLE PROFILE_(
PROFILE_CODE INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
EMAIL VARCHAR (40) UNIQUE,
USER_NAME VARCHAR (30) UNIQUE,
PSWD VARCHAR (240),
TELEPHONE BIGINT,
NAME_ VARCHAR (30),
SURNAME VARCHAR (30)
);

CREATE TABLE USER_(
PROFILE_CODE INT NOT NULL PRIMARY KEY,
GENDER VARCHAR (10),
CARD_NO VARCHAR (50),
FOREIGN KEY (PROFILE_CODE) REFERENCES PROFILE_(PROFILE_CODE) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE ADMIN_(
PROFILE_CODE INT NOT NULL PRIMARY KEY,
CURRENT_ACCOUNT VARCHAR (50),
FOREIGN KEY (PROFILE_CODE) REFERENCES PROFILE_(PROFILE_CODE) ON UPDATE CASCADE ON DELETE CASCADE
);


INSERT INTO PROFILE_ (PROFILE_CODE, EMAIL, USER_NAME, PSWD, TELEPHONE, NAME_, SURNAME) VALUES
(1, 'juan.perez@email.com', 'juanP', '1234', 611223344, 'Juan', 'Pérez'),
(2, 'maria.garcia@email.com', 'mariag', '1234', 622334455, 'María', 'García'),
(3, 'carlos.lopez@email.com', 'carlosl', '1234', 633445566, 'Carlos', 'López'),
(4, 'ana.martinez@email.com', 'anam', '1234', 644556677, 'Ana', 'Martínez'),
(5, 'pedro.rodriguez@email.com', 'pedror', '1234', 655667788, 'Pedro', 'Rodríguez');


INSERT INTO USER_ (PROFILE_CODE, GENDER, CARD_NO) VALUES
(1, 'Man', '1234-5678-9012-3456'),
(2, 'Female', '2345-6789-0123-4567'),
(3, 'Man', '3456-7890-1234-5678');


INSERT INTO ADMIN_ (PROFILE_CODE, CURRENT_ACCOUNT) VALUES
(4, 'ES12-3456-7890-1234-5678'),
(5, 'ES98-7654-3210-9876-5432');

DELIMITER //
CREATE PROCEDURE RegistrarUsuario( IN p_username VARCHAR(30), IN p_pswd VARCHAR(240))
BEGIN
    DECLARE  nuevo_profile_code INT;
    
    INSERT INTO PROFILE_ (EMAIL, USER_NAME, PSWD, TELEPHONE, NAME_, SURNAME)
    VALUES (null, p_username, p_pswd, null, null, null);

    SET nuevo_profile_code = LAST_INSERT_ID();

    INSERT INTO USER_ (PROFILE_CODE, GENDER, CARD_NO)
    VALUES (nuevo_profile_code, null, null);
    
    SELECT * FROM PROFILE_ P, USER_ U WHERE P.PROFILE_CODE = U.PROFILE_CODE AND P.PROFILE_CODE= nuevo_profile_code;
 END //

DELIMITER ; 

CREATE TABLE COMPANY_(
Url text,
C_name varchar(30),
NIF varchar(9)not null primary key,
location text);

CREATE TABLE PRODUCT_(
Price double,
Product_type enum('Cloth', 'Shoe'),
Descript text,
Product_ID varchar(15) not null primary key,
Img text,
NIF varchar(9)not null,
foreign key (NIF) references COMPANY_(NIF)
);

CREATE TABLE SIZE_(
Stock int,
label varchar (10),
Product_ID varchar(15) not null,
foreign key (Product_ID) references PRODUCT_(Product_ID));

Insert into COMPANY_ (Url, C_name, NIF, location) VALUES
("https://www.youtube.com/watch?v=2NbBi5I7DB8", "Yara", "123456789", "Palermo, Sizilia"),("https://www.youtube.com/watch?v=2NbBi5I7DB8", "Ñoldan", "321654987", "Wailuku, Hawái");

Insert into PRODUCT_ (Price, Product_type, Descript, Product_ID, Img, NIF) Values
(15.99, "Cloth", "a blu shert","aaa111","//view/assets/img/baldinkent.png","123456789"),(20.99, "Shoe", "a blu sue","111aaa","//view/assets/imgYara_shoe.png","123456789"),
(14.59, "Cloth", "a cul shert", "bbb222","//view/assets/img/Negra_tengo_el_alma.png","321654987"),(14.59, "Shoe", "a cul sue", "222bbb","//view/assets/img/Ñoldan.png","321654987");

Insert into SIZE_(Stock,label,Product_ID)Values
(0,"XXL","aaa111"),(4,"XL","aaa111"),(5,"L","aaa111"),(8,"M","aaa111"),(9,"S","aaa111"),(0,"XS","aaa111"),
(2,"XXL","aaa111"),(0,"XL","aaa111"),(3,"L","aaa111"),(4,"M","aaa111"),(6,"S","aaa111"),(0,"XS","aaa111"),
(2,"XXL","aaa111"),(0,"XL","aaa111"),(0,"L","aaa111"),(7,"M","aaa111"),(0,"S","aaa111"),(9,"XS","aaa111"),
(0,"XXL","aaa111"),(0,"XL","aaa111"),(3,"L","aaa111"),(7,"M","aaa111"),(0,"S","aaa111"),(1,"XS","aaa111");

